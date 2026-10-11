// public/js/geo.js
// Real Browser Geolocation, Reverse-Geocoding, and Manual Location Fallback

class RakshaGeoManager {
  constructor() {
    this.currentLocation = null;
    this.searchRadiusKm = 15;
    this.permissionState = 'prompt'; // 'prompt', 'granted', 'denied'
    this.isWatching = false;
    this.watchId = null;

    // Load cached location from localStorage if available
    this.loadCachedLocation();
  }

  loadCachedLocation() {
    try {
      const cached = localStorage.getItem('raksha_user_location');
      if (cached) {
        this.currentLocation = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('[Geo] Failed to load cached location', e);
    }
  }

  saveLocation(loc) {
    this.currentLocation = loc;
    try {
      localStorage.setItem('raksha_user_location', JSON.stringify(loc));
    } catch (e) {
      console.warn('[Geo] Failed to persist location to storage', e);
    }

    if (window.rakshaState) {
      window.rakshaState.setLocation(loc);
    }
  }

  /**
   * Request actual device GPS coordinates using Capacitor native plugin or browser API
   * @returns {Promise<object>} Resolved location object
   */
  async requestBrowserLocation() {
    // 1. Try Native Capacitor Geolocation plugin if available
    const capacitorGeo = window.Capacitor?.Plugins?.Geolocation;
    if (capacitorGeo) {
      try {
        let perm = await capacitorGeo.checkPermissions().catch(() => ({ location: 'prompt' }));
        if (perm.location !== 'granted') {
          perm = await capacitorGeo.requestPermissions({ permissions: ['location'] }).catch(() => ({ location: 'denied' }));
        }

        if (perm.location === 'denied') {
          this.permissionState = 'denied';
          throw new Error('Location permission was denied. You can search manually by village, town, or PIN code.');
        }

        const pos = await capacitorGeo.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });

        this.permissionState = 'granted';
        const { latitude, longitude, accuracy } = pos.coords;
        return await this.resolveAndSaveLocation(latitude, longitude, accuracy, 'Native GPS (Capacitor)');
      } catch (err) {
        if (err.message && err.message.includes('denied')) {
          throw err;
        }
        console.warn('[Geo] Capacitor native geolocation unavailable or failed; using browser fallback:', err.message);
      }
    }

    // 2. Standard Web Geolocation Fallback
    if (!navigator.geolocation) {
      this.permissionState = 'denied';
      throw new Error('Geolocation is not supported on this device.');
    }

    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.permissionState = 'granted';
          const { latitude, longitude, accuracy } = position.coords;
          try {
            const loc = await this.resolveAndSaveLocation(latitude, longitude, accuracy, 'Device GPS (Verified)');
            resolve(loc);
          } catch (e) {
            reject(e);
          }
        },
        (error) => {
          this.permissionState = 'denied';
          let message = 'Location access denied or unavailable.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission was denied. You can search manually by village, town, or PIN code.';
          } else if (error.code === error.TIMEOUT) {
            message = 'GPS detection timed out. Please search manually or check your device settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location unavailable. Ensure GPS is enabled or search manually.';
          }
          reject(new Error(message));
        },
        options
      );
    });
  }

  async resolveAndSaveLocation(latitude, longitude, accuracy, sourceTag) {
    try {
      const geoRes = await window.rakshaApi.reverseGeocode(latitude, longitude);

      const resolvedLocation = {
        lat: latitude,
        lon: longitude,
        accuracyMeters: Math.round(accuracy || 0),
        displayName: geoRes.displayName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        locality: geoRes.locality || 'Current Area',
        district: geoRes.district || 'Local District',
        state: geoRes.state || 'India',
        pincode: geoRes.pincode || '',
        source: sourceTag || 'Verified GPS',
        timestamp: new Date().toISOString()
      };

      this.saveLocation(resolvedLocation);
      return resolvedLocation;
    } catch (err) {
      const fallbackLoc = {
        lat: latitude,
        lon: longitude,
        accuracyMeters: Math.round(accuracy || 0),
        displayName: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        locality: 'Detected GPS Location',
        district: 'Current District',
        state: 'India',
        pincode: '',
        source: sourceTag || 'Direct Device GPS',
        timestamp: new Date().toISOString()
      };

      this.saveLocation(fallbackLoc);
      return fallbackLoc;
    }
  }

  /**
   * Set location manually by village, town, city, or PIN code
   */
  async setManualLocation(queryOrLocation) {
    let locationObj = null;

    if (typeof queryOrLocation === 'object' && queryOrLocation.lat != null && queryOrLocation.lon != null) {
      locationObj = {
        lat: parseFloat(queryOrLocation.lat),
        lon: parseFloat(queryOrLocation.lon),
        accuracyMeters: null,
        displayName: queryOrLocation.displayName || queryOrLocation.locality,
        locality: queryOrLocation.locality || 'Selected Area',
        district: queryOrLocation.district || '',
        state: queryOrLocation.state || 'India',
        pincode: queryOrLocation.pincode || '',
        source: 'Manual Search',
        timestamp: new Date().toISOString()
      };
    } else {
      const query = String(queryOrLocation || '').trim();
      if (!query || query.length < 2) {
        throw new Error('Please enter a valid village, city, district, or PIN code.');
      }

      const results = await window.rakshaApi.searchLocation(query);
      if (!results || results.length === 0) {
        throw new Error(`No location match found for "${query}". Try adding state name or PIN code.`);
      }

      const best = results[0];
      locationObj = {
        lat: best.lat,
        lon: best.lon,
        accuracyMeters: null,
        displayName: best.displayName,
        locality: best.locality || query,
        district: best.district || '',
        state: best.state || 'India',
        pincode: best.pincode || '',
        source: 'Manual Search',
        timestamp: new Date().toISOString()
      };
    }

    this.saveLocation(locationObj);
    return locationObj;
  }

  setSearchRadius(radiusKm) {
    this.searchRadiusKm = radiusKm;
    if (window.rakshaState) {
      window.rakshaState.setRadius(radiusKm);
    }
  }
}

window.rakshaGeo = new RakshaGeoManager();
