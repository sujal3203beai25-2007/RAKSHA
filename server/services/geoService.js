// server/services/geoService.js
// Geospatial calculations, OpenStreetMap Nominatim reverse-geocoding, and Overpass facility discovery

const config = require('../config');

// In-memory cache to respect OpenStreetMap rate-limits (1 req/sec max) and provide instant responses
const geocodeCache = new Map();
const overpassCache = new Map();

/**
 * Calculate Great-Circle Distance using Haversine Formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers (rounded to 1 decimal place)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Reverse geocode coordinates to human-readable address with locality, district, state, PIN
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
async function reverseGeocode(lat, lon) {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': config.nominatimUserAgent,
        'Accept-Language': 'en,hi'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};

    const locality = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.residential || addr.road || 'Current Location';
    const district = addr.county || addr.state_district || addr.city || addr.town || 'District';
    const state = addr.state || 'India';
    const pincode = addr.postcode || '';

    const result = {
      displayName: data.display_name || `${locality}, ${district}, ${state}`,
      locality,
      district,
      state,
      pincode,
      lat: parseFloat(data.lat || lat),
      lon: parseFloat(data.lon || lon),
      source: 'OpenStreetMap Nominatim'
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[GeoService] Reverse geocode fallback:', err.message);
    // Graceful fallback without crashing
    return {
      displayName: `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      locality: 'Detected Coordinates',
      district: 'Local District',
      state: 'India',
      pincode: '',
      lat,
      lon,
      source: 'Direct GPS'
    };
  }
}

/**
 * Search location coordinates by text (village, town, district, PIN code)
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = query.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': config.nominatimUserAgent,
        'Accept-Language': 'en,hi'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Search error: ${res.status}`);
    const list = await res.json();

    const results = list.map(item => {
      const addr = item.address || {};
      return {
        displayName: item.display_name,
        locality: addr.suburb || addr.village || addr.town || addr.city || item.name,
        district: addr.county || addr.state_district || addr.city || '',
        state: addr.state || '',
        pincode: addr.postcode || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type
      };
    });

    geocodeCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('[GeoService] Location search error:', err.message);
    return [];
  }
}

/**
 * Fetch nearby healthcare facilities via OpenStreetMap Overpass API with multi-endpoint fallback
 * @param {number} lat
 * @param {number} lon
 * @param {number} radiusKm
 * @returns {Promise<Array>}
 */
async function fetchOverpassHospitals(lat, lon, radiusKm = 10) {
  const radiusMeters = Math.min(50000, Math.max(1000, radiusKm * 1000));
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)},${radiusKm}`;

  if (overpassCache.has(cacheKey)) {
    return overpassCache.get(cacheKey);
  }

  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="clinic"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="blood_bank"](around:${radiusMeters},${lat},${lon});
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
    );
    out center 30;
  `;

  const endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    config.overpassApiUrl || 'https://overpass-api.de/api/interpreter'
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'RAKSHA-HealthcarePlatform/1.0 (healthcare-access@raksha.org.in; SIH 2026)',
          'Accept': 'application/json'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const elements = data.elements || [];

      if (elements.length > 0) {
        const facilities = elements.map(el => {
          const elLat = el.lat || (el.center && el.center.lat);
          const elLon = el.lon || (el.center && el.center.lon);
          const tags = el.tags || {};
          const name = tags.name || tags['name:en'] || tags['name:hi'] || (tags.amenity === 'pharmacy' ? 'Community Pharmacy' : 'Health Facility');
          const dist = calculateDistanceKm(lat, lon, elLat, elLon);

          let category = 'Hospital';
          if (tags.amenity === 'clinic' || tags.healthcare === 'clinic') category = 'Clinic / PHC';
          else if (tags.amenity === 'pharmacy') category = 'Pharmacy';
          else if (tags.healthcare === 'blood_bank') category = 'Blood Bank';
          else if (tags.emergency === 'yes') category = 'Emergency Trauma Centre';

          return {
            id: `osm-${el.id}`,
            name,
            category,
            address: tags['addr:street'] ? `${tags['addr:street']}, ${tags['addr:city'] || ''}` : `${name}, Local Area`,
            locality: tags['addr:suburb'] || tags['addr:district'] || '',
            district: tags['addr:district'] || tags['addr:city'] || 'Local District',
            state: tags['addr:state'] || 'India',
            pincode: tags['addr:postcode'] || '',
            lat: elLat,
            lon: elLon,
            phone: tags.phone || tags['contact:phone'] || null,
            website: tags.website || tags['contact:website'] || null,
            govt: tags.operator_type === 'public' || tags.operator === 'Government' ? 1 : 0,
            pmjay: 0,
            distanceKm: dist,
            source: 'OpenStreetMap Live Overpass (Community Map Data)',
            verification_status: 'COMMUNITY_UNVERIFIED',
            verified: 0,
            isBookable: false,
            last_verified: null,
            hasEmergency: tags.emergency === 'yes'
          };
        }).filter(f => f.lat != null && f.lon != null);

        overpassCache.set(cacheKey, facilities);
        return facilities;
      }
    } catch (err) {
      console.warn(`[GeoService] Overpass ${ep} query failed:`, err.message);
    }
  }

  // Fallback: Query Nominatim for healthcare amenities in bounding box
  try {
    const delta = (radiusKm / 111.0); // approx degrees
    const minLat = (lat - delta).toFixed(4);
    const maxLat = (lat + delta).toFixed(4);
    const minLon = (lon - delta).toFixed(4);
    const maxLon = (lon + delta).toFixed(4);

    const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&amenity=hospital&countrycodes=in&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=15&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(nomUrl, {
      headers: {
        'User-Agent': 'RAKSHA-HealthcarePlatform/1.0 (healthcare-access@raksha.org.in; SIH 2026)',
        'Accept-Language': 'en,hi'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const items = await res.json();
      const facilities = items.map(item => {
        const addr = item.address || {};
        const elLat = parseFloat(item.lat);
        const elLon = parseFloat(item.lon);
        const name = item.name || item.display_name.split(',')[0];
        const dist = calculateDistanceKm(lat, lon, elLat, elLon);

        return {
          id: `nom-${item.place_id}`,
          name,
          category: 'Hospital / Healthcare Centre',
          address: item.display_name,
          locality: addr.suburb || addr.neighbourhood || addr.village || '',
          district: addr.county || addr.city || addr.state_district || 'District',
          state: addr.state || 'India',
          pincode: addr.postcode || '',
          lat: elLat,
          lon: elLon,
          phone: null,
          website: null,
          govt: 0,
          pmjay: 0,
          distanceKm: dist,
          source: 'OpenStreetMap Nominatim Directory (Community Map Data)',
          verification_status: 'COMMUNITY_UNVERIFIED',
          verified: 0,
          isBookable: false,
          last_verified: null,
          hasEmergency: false
        };
      }).filter(f => f.lat != null && f.lon != null);

      overpassCache.set(cacheKey, facilities);
      return facilities;
    }
  } catch (nomErr) {
    console.warn('[GeoService] Nominatim fallback failed:', nomErr.message);
  }

  return [];
}

module.exports = {
  calculateDistanceKm,
  reverseGeocode,
  searchLocation,
  fetchOverpassHospitals
};

