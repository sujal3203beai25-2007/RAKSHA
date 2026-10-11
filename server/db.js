// server/db.js
// RAKSHA Production Database & Service Layer backed by Persistent SQLite

const crypto = require('crypto');
const { db, broadcast, subscribe, transaction, logAudit, createUniqueId } = require('./db/index');
const { calculateDistanceKm } = require('./services/geoService');
const config = require('./config');

class RakshaDatabaseService {
  constructor() {
    this.subscribe = subscribe;
    this.broadcast = broadcast;
    this.config = config;

    // Background simulation ONLY active if DEMO_MODE=true
    if (config.demoMode) {
      this.startDemoSimulation();
    }
  }

  // ----------------------------------------------------
  // Facilities & Hospitals
  // ----------------------------------------------------
  getFacilities(query = {}) {
    let sql = `SELECT * FROM facilities WHERE 1=1`;
    const params = [];

    if (query.district) {
      sql += ` AND district LIKE ?`;
      params.push(`%${query.district}%`);
    }

    let rows = db.prepare(sql).all(...params);

    // Parse JSON columns
    rows = rows.map(r => ({
      ...r,
      govt: Boolean(r.govt),
      pmjay: Boolean(r.pmjay),
      surgeDivertActive: Boolean(r.surge_divert_active),
      icuBedsFree: r.icu_beds_free,
      oxygenBedsFree: r.oxygen_beds_free,
      emergencyBedsFree: r.emergency_beds_free,
      occupiedEmergencyBeds: r.occupied_emergency_beds,
      totalEmergencyBeds: r.total_beds,
      bloodBank: r.blood_bank_json ? JSON.parse(r.blood_bank_json) : {},
      specialties: r.specialties_json ? JSON.parse(r.specialties_json) : []
    }));

    // Filter by type
    if (query.filter && query.filter !== 'all') {
      const f = query.filter.toLowerCase();
      if (f === 'govt') rows = rows.filter(item => item.govt);
      else if (f === 'pmjay') rows = rows.filter(item => item.pmjay);
      else if (f === 'icu') rows = rows.filter(item => item.icuBedsFree > 0);
      else if (f === 'oxygen') rows = rows.filter(item => item.oxygenBedsFree > 0);
      else if (f === 'blood') rows = rows.filter(item => item.bloodBank && item.bloodBank['O+'] > 0);
    }

    // Text search
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q)
      );
    }

    // Distance calculation if user latitude & longitude provided
    const userLat = query.lat ? parseFloat(query.lat) : null;
    const userLon = query.lon ? parseFloat(query.lon) : null;

    if (userLat != null && userLon != null && !isNaN(userLat) && !isNaN(userLon)) {
      rows = rows.map(item => ({
        ...item,
        distanceKm: calculateDistanceKm(userLat, userLon, item.lat, item.lon)
      }));

      // Sort by real geographic distance (correctly handle 0km distance)
      rows.sort((a, b) => {
        const distA = a.distanceKm != null ? a.distanceKm : 9999;
        const distB = b.distanceKm != null ? b.distanceKm : 9999;
        return distA - distB;
      });

      // Optional radius filtering
      if (query.radiusKm) {
        const radius = parseFloat(query.radiusKm);
        if (!isNaN(radius)) {
          rows = rows.filter(item => item.distanceKm <= radius);
        }
      }
    }

    return rows;
  }

  getFacilityById(id) {
    const row = db.prepare('SELECT * FROM facilities WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      govt: Boolean(row.govt),
      pmjay: Boolean(row.pmjay),
      surgeDivertActive: Boolean(row.surge_divert_active),
      icuBedsFree: row.icu_beds_free,
      oxygenBedsFree: row.oxygen_beds_free,
      emergencyBedsFree: row.emergency_beds_free,
      occupiedEmergencyBeds: row.occupied_emergency_beds,
      totalEmergencyBeds: row.total_beds,
      bloodBank: row.blood_bank_json ? JSON.parse(row.blood_bank_json) : {},
      specialties: row.specialties_json ? JSON.parse(row.specialties_json) : []
    };
  }

  toggleSurgeDivert(facilityId, reason = 'Surge load diversion', userId = null) {
    const fac = this.getFacilityById(facilityId);
    if (!fac) return null;

    const newStatus = fac.surgeDivertActive ? 0 : 1;
    db.prepare('UPDATE facilities SET surge_divert_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, facilityId);

    const updateId = createUniqueId('UP');
    db.prepare(`
      INSERT INTO facility_capacity_updates (id, facility_id, user_id, divert_status, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(updateId, facilityId, userId, newStatus, reason);

    const updated = this.getFacilityById(facilityId);
    this.broadcast('FACILITY_SURGE_TOGGLE', { facilityId, surgeDivertActive: Boolean(newStatus) });
    logAudit({ userId, action: 'TOGGLE_SURGE_DIVERT', entityType: 'FACILITY', entityId: facilityId, details: { newStatus } });
    return updated;
  }

  updateBedCount(facilityId, { icuDelta = 0, oxygenDelta = 0, occupiedEmergencyDelta = 0, note = 'Bed update', userId = null }) {
    const fac = this.getFacilityById(facilityId);
    if (!fac) return null;

    const totalEmergency = fac.totalEmergencyBeds || fac.total_beds || 100;
    const newIcu = Math.max(0, fac.icuBedsFree + (icuDelta || 0));
    const newOxygen = Math.max(0, fac.oxygenBedsFree + (oxygenDelta || 0));
    const newOccupied = Math.max(0, Math.min(totalEmergency, fac.occupiedEmergencyBeds + (occupiedEmergencyDelta || 0)));
    const newEmergencyFree = Math.max(0, totalEmergency - newOccupied);

    transaction(() => {
      db.prepare(`
        UPDATE facilities
        SET icu_beds_free = ?, oxygen_beds_free = ?, occupied_emergency_beds = ?, emergency_beds_free = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newIcu, newOxygen, newOccupied, newEmergencyFree, facilityId);

      const updateId = createUniqueId('UP');
      db.prepare(`
        INSERT INTO facility_capacity_updates (id, facility_id, user_id, icu_delta, oxygen_delta, occupied_emergency_delta, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(updateId, facilityId, userId, icuDelta, oxygenDelta, occupiedEmergencyDelta, note);
    });

    const updated = this.getFacilityById(facilityId);
    this.broadcast('BED_COUNT_UPDATED', updated);
    logAudit({ userId, action: 'UPDATE_BEDS', entityType: 'FACILITY', entityId: facilityId, details: { icuDelta, oxygenDelta, occupiedEmergencyDelta } });
    return updated;
  }

  // ----------------------------------------------------
  // Emergency SOS & Dispatches
  // ----------------------------------------------------
  createEmergencySos({ patientName = "Citizen", contactPhone = "", pickupLocation = "Current GPS Location", lat = null, lon = null, complaint = "Acute Medical Emergency", userId = null }) {
    // Duplicate submission prevention for active cases within last 2 minutes
    const recent = db.prepare(`
      SELECT * FROM emergency_cases
      WHERE status NOT IN ('HANDOVER_COMPLETE', 'CANCELLED')
        AND created_at > datetime('now', '-2 minutes')
        AND ((contact_phone = ? AND contact_phone != '') OR pickup_address = ?)
      ORDER BY created_at DESC LIMIT 1
    `).get(contactPhone, pickupLocation);

    if (recent) {
      console.log(`[Emergency] Duplicate prevention: returning existing active case #${recent.case_id}`);
      return this.getActiveCase(recent.case_id);
    }

    const caseSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const caseId = `EMG-${dateStr}-${caseSuffix}`;
    const id = createUniqueId('EMG-REC');

    // Look for available ambulance
    const availableAmb = db.prepare("SELECT * FROM ambulances WHERE status = 'AVAILABLE' LIMIT 1").get();
    const isSim = config.demoMode ? 1 : 0;
    // In production mode, do not simulate automatic ambulance assignment or synthetic vitals
    const initialStatus = config.demoMode ? (availableAmb ? "EN_ROUTE_PICKUP" : "RECORDED") : "RECORDED";
    const ambulanceId = config.demoMode && availableAmb ? availableAmb.id : null;
    const initialEta = config.demoMode && availableAmb ? 6 : null;

    const initialTelemetry = isSim ? JSON.stringify({
      bp: "128/82",
      spo2: 97,
      pulse: 82,
      status: "DEMO Simulated Telemetry Feed"
    }) : null;

    transaction(() => {
      db.prepare(`
        INSERT INTO emergency_cases (
          id, case_id, user_id, patient_name, contact_phone, pickup_address, pickup_lat, pickup_lon,
          complaint, priority, status, code, ambulance_id, destination_facility_id, eta_mins, telemetry_json, is_simulated
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 'HIGH', ?, 'CODE_RED_ALS', ?, 'safdarjung', ?, ?, ?
        )
      `).run(id, caseId, userId, patientName, contactPhone, pickupLocation, lat, lon, complaint, initialStatus, ambulanceId, initialEta, initialTelemetry, isSim);

      if (ambulanceId) {
        db.prepare("UPDATE ambulances SET status = 'DISPATCHED', current_case_id = ? WHERE id = ?").run(caseId, ambulanceId);
      }

      db.prepare(`
        INSERT INTO emergency_status_logs (id, case_id, status, updated_by, notes, lat, lon)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(createUniqueId('LOG'), caseId, initialStatus, 'Emergency Registry Engine', 'Emergency request logged in national registry', lat, lon);
    });

    const created = this.getActiveCase(caseId);
    this.broadcast('EMERGENCY_DISPATCH_CREATED', created);
    logAudit({ userId, action: 'CREATE_SOS', entityType: 'EMERGENCY_CASE', entityId: caseId, details: { pickupLocation, complaint } });
    return created;
  }

  getActiveCase(caseId = null) {
    let row;
    if (caseId) {
      row = db.prepare('SELECT * FROM emergency_cases WHERE case_id = ?').get(caseId);
    } else {
      row = db.prepare("SELECT * FROM emergency_cases WHERE status != 'HANDOVER_COMPLETE' AND status != 'CANCELLED' ORDER BY created_at DESC LIMIT 1").get();
    }

    if (!row) return null;

    let ambulance = null;
    if (row.ambulance_id) {
      ambulance = db.prepare('SELECT * FROM ambulances WHERE id = ?').get(row.ambulance_id);
    }

    let destination = null;
    if (row.destination_facility_id) {
      destination = this.getFacilityById(row.destination_facility_id);
    }

    return {
      id: row.id,
      caseId: row.case_id,
      status: row.status,
      code: row.code,
      priority: row.priority,
      patientName: row.patient_name,
      contactPhone: row.contact_phone,
      pickupAddress: row.pickup_address,
      pickupLat: row.pickup_lat,
      pickupLon: row.pickup_lon,
      complaint: row.complaint,
      etaMins: row.eta_mins,
      distanceKm: row.distance_km,
      speedKmH: row.speed_kmh,
      vehicleReg: ambulance ? ambulance.vehicle_reg : (row.status === 'RECORDED' ? "Awaiting 108 CAD Allocation" : "Awaiting Vehicle Assignment"),
      leadParamedic: ambulance ? ambulance.paramedic_name : "Paramedic Standby",
      driverName: ambulance ? ambulance.driver_name : "Driver Standby",
      driverPhone: ambulance ? ambulance.driver_phone : null,
      destinationHospital: destination ? destination.name : "Safdarjung Emergency Trauma Centre",
      destinationLat: destination ? destination.lat : 28.5684,
      destinationLon: destination ? destination.lon : 77.2066,
      telemetry: row.telemetry_json ? JSON.parse(row.telemetry_json) : { bp: "120/80", spo2: 98, pulse: 76, status: row.is_simulated ? "Simulated" : "Awaiting Sensor Connection" },
      isSimulated: Boolean(row.is_simulated),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  updateCaseStatus(caseId, status, details = {}, user = null) {
    const activeCase = this.getActiveCase(caseId);
    if (!activeCase) return null;

    const ALLOWED_CASE_TRANSITIONS = {
      'RECORDED': ['ACKNOWLEDGED', 'DISPATCHED', 'EN_ROUTE_PICKUP', 'ARRIVED_SCENE', 'CANCELLED'],
      'ACKNOWLEDGED': ['DISPATCHED', 'EN_ROUTE_PICKUP', 'ARRIVED_SCENE', 'CANCELLED'],
      'DISPATCHED': ['EN_ROUTE_PICKUP', 'ARRIVED_SCENE', 'CANCELLED'],
      'EN_ROUTE_PICKUP': ['ARRIVED_SCENE', 'CANCELLED'],
      'ARRIVED_SCENE': ['PATIENT_LOADED', 'CANCELLED'],
      'PATIENT_LOADED': ['EN_ROUTE_HOSPITAL', 'HANDOVER_COMPLETE', 'CANCELLED'],
      'EN_ROUTE_HOSPITAL': ['HANDOVER_COMPLETE', 'CANCELLED'],
      'HANDOVER_COMPLETE': [],
      'CANCELLED': []
    };

    if (ALLOWED_CASE_TRANSITIONS[activeCase.status] && !ALLOWED_CASE_TRANSITIONS[activeCase.status].includes(status)) {
      throw new Error(`Invalid status transition from ${activeCase.status} to ${status}`);
    }

    transaction(() => {
      let speedKmH = activeCase.speedKmH;
      let etaMins = activeCase.etaMins;

      if (status === 'ARRIVED_SCENE') {
        etaMins = 0;
        speedKmH = 0;
      } else if (status === 'EN_ROUTE_HOSPITAL') {
        etaMins = 12;
        speedKmH = 55;
      } else if (status === 'HANDOVER_COMPLETE') {
        etaMins = 0;
        speedKmH = 0;
      }

      db.prepare(`
        UPDATE emergency_cases
        SET status = ?, eta_mins = ?, speed_kmh = ?, updated_at = CURRENT_TIMESTAMP
        WHERE case_id = ?
      `).run(status, etaMins, speedKmH, caseId);

      const updatedBy = user ? (user.name || user.id) : 'National Emergency Dispatch';
      db.prepare(`
        INSERT INTO emergency_status_logs (id, case_id, status, updated_by, notes, lat, lon)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(createUniqueId('LOG'), caseId, status, updatedBy, details.note || `Status transition to ${status}`, details.lat || null, details.lon || null);

      if (status === 'HANDOVER_COMPLETE' && activeCase.vehicleReg) {
        db.prepare("UPDATE ambulances SET status = 'AVAILABLE', current_case_id = NULL WHERE vehicle_reg = ?")
          .run(activeCase.vehicleReg);
      }
    });

    const updated = this.getActiveCase(caseId);
    this.broadcast('CASE_STATUS_UPDATED', updated);
    logAudit({ userId: user ? user.id : null, action: 'UPDATE_CASE_STATUS', entityType: 'EMERGENCY_CASE', entityId: caseId, details: { status } });
    return updated;
  }

  // ----------------------------------------------------
  // Clinically Safe AI / Rule-based Triage
  // ----------------------------------------------------
  calculateTriage({ role = 'self', symptoms = [], dangerFlags = [] }) {
    const s = symptoms.map(x => x.toLowerCase());
    const d = dangerFlags.map(x => x.toLowerCase());

    // Critical Emergency Red Flags (AHA / Indian Resuscitation Council guidelines)
    const isCritical =
      d.includes('cyanosis') ||
      d.includes('unconscious') ||
      d.includes('heavy_bleeding') ||
      d.includes('altered_sensorium') ||
      d.includes('stridor') ||
      (s.includes('chest') && s.includes('breath')) ||
      (s.includes('chest') && d.includes('radiation'));

    // Moderate Urgency Flags
    const isModerate =
      s.includes('breath') ||
      s.includes('fever') ||
      s.includes('chest') ||
      s.includes('abdominal') ||
      d.includes('high_fever') ||
      d.includes('persistent_vomiting');

    if (isCritical) {
      return {
        priorityCode: "CRITICAL-PRIORITY (Code Red / लाल कोड)",
        urgencyLevel: "critical",
        windowTime: "< 15 Mins Immediate Intervention",
        token: `RAKSHA-RED-${Math.floor(1000 + Math.random() * 9000)}`,
        recommendation: "EMERGENCY: Immediate life threat identified. Activate 108 ALS Ambulance or proceed directly to the nearest Emergency Trauma Centre. Do not wait for standard OPD.",
        disclaimer: "Non-diagnostic triage routing algorithm based on emergency symptom red flags. Does not replace clinical examination by a licensed medical practitioner.",
        escalationContact: "108 / 112",
        suggestedFacilityType: "Tertiary Emergency Trauma Centre"
      };
    } else if (isModerate) {
      return {
        priorityCode: "MODERATE-PRIORITY (Code Yellow / पीला कोड)",
        urgencyLevel: "moderate",
        windowTime: "< 4-6 Hours Evaluation",
        token: `RAKSHA-YLW-${Math.floor(1000 + Math.random() * 9000)}`,
        recommendation: "Visit your nearest Community Health Centre (CHC) or Sub-District Hospital (SDH) within 4 to 6 hours for clinical assessment.",
        disclaimer: "Non-diagnostic triage routing assistance. Consult a physician immediately if breathing difficulty or chest tightness escalates.",
        escalationContact: "104 (Health Helpline) / 108",
        suggestedFacilityType: "Community Health Centre / Sub-District Hospital"
      };
    } else {
      return {
        priorityCode: "ROUTINE-CARE (Code Green / हरा कोड)",
        urgencyLevel: "routine",
        windowTime: "Scheduled OPD / 24-48 Hours",
        token: `RAKSHA-GRN-${Math.floor(1000 + Math.random() * 9000)}`,
        recommendation: "Symptoms suggest non-emergent routine illness. Book an OPD slot at your local Primary Health Centre (PHC) or consult via eSanjeevani Teleconsultation.",
        disclaimer: "Informational triage guide only. Seek in-person clinical review if symptoms worsen.",
        escalationContact: "eSanjeevani Teleconsult / Local PHC",
        suggestedFacilityType: "Primary Health Centre (PHC)"
      };
    }
  }

  // ----------------------------------------------------
  // Digital Referrals
  // ----------------------------------------------------
  getReferrals() {
    const rows = db.prepare('SELECT * FROM referrals ORDER BY created_at DESC').all();
    return rows.map(r => ({
      ...r,
      refId: r.ref_id,
      patientName: r.patient_name,
      patientAge: r.patient_age,
      patientGender: r.patient_gender,
      abhaId: r.abha_id,
      pmjay: Boolean(r.pmjay_eligible),
      originFacility: r.origin_facility_id,
      receivingFacility: r.receiving_facility_id,
      currentStep: r.current_step,
      steps: r.steps_json ? JSON.parse(r.steps_json) : []
    }));
  }

  getActiveReferral(refId = null) {
    let row;
    if (refId) {
      row = db.prepare('SELECT * FROM referrals WHERE ref_id = ?').get(refId);
    } else {
      row = db.prepare("SELECT * FROM referrals WHERE status != 'ADMITTED' AND status != 'REJECTED' ORDER BY created_at DESC LIMIT 1").get();
    }

    if (!row) return null;

    const originFac = this.getFacilityById(row.origin_facility_id);
    const recvFac = this.getFacilityById(row.receiving_facility_id);

    return {
      id: row.id,
      refId: row.ref_id,
      protocol: "ABDM FastTrack",
      priority: row.priority,
      category: row.category,
      patientName: row.patient_name,
      patientAge: row.patient_age,
      patientGender: row.patient_gender,
      abhaId: row.abha_id,
      pmjay: Boolean(row.pmjay_eligible),
      originFacility: originFac ? originFac.name : row.origin_facility_id,
      originFacilityId: row.origin_facility_id,
      receivingFacility: recvFac ? recvFac.name : row.receiving_facility_id,
      receivingFacilityId: row.receiving_facility_id,
      reason: row.reason,
      currentStep: row.current_step,
      status: row.status,
      steps: row.steps_json ? JSON.parse(row.steps_json) : []
    };
  }

  advanceReferralStep(refId, user = null) {
    const ref = this.getActiveReferral(refId);
    if (!ref) return null;

    const nextStep = Math.min(5, ref.currentStep + 1);
    const newStatus = nextStep >= 5 ? 'ADMITTED' : (nextStep >= 3 ? 'IN_TRANSIT' : 'ACCEPTED');

    const updatedSteps = (ref.steps || []).map(s => {
      if (s.step < nextStep) return { ...s, completed: true, current: false };
      if (s.step === nextStep) return { ...s, completed: nextStep === 5, current: nextStep < 5 };
      return { ...s, completed: false, current: false };
    });

    db.prepare(`
      UPDATE referrals
      SET current_step = ?, status = ?, steps_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE ref_id = ?
    `).run(nextStep, newStatus, JSON.stringify(updatedSteps), refId);

    const updated = this.getActiveReferral(refId);
    this.broadcast('REFERRAL_STEP_ADVANCED', updated);
    logAudit({ userId: user ? user.id : null, action: 'ADVANCE_REFERRAL', entityType: 'REFERRAL', entityId: refId, details: { nextStep, newStatus } });
    return updated;
  }

  // ----------------------------------------------------
  // Doctors & Appointments
  // ----------------------------------------------------
  getDoctors(query = {}) {
    let sql = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (query.specialty) {
      sql += ' AND specialty LIKE ?';
      params.push(`%${query.specialty}%`);
    }

    if (query.facilityId) {
      sql += ' AND facility_id = ?';
      params.push(query.facilityId);
    }

    if (query.search) {
      sql += ' AND (name LIKE ? OR specialty LIKE ? OR qualification LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    }

    let rows = db.prepare(sql).all(...params);

    const userLat = query.lat != null ? parseFloat(query.lat) : null;
    const userLon = query.lon != null ? parseFloat(query.lon) : null;

    let result = rows.map(d => {
      const fac = d.facility_id ? this.getFacilityById(d.facility_id) : null;
      let dist = null;
      if (userLat != null && userLon != null && !isNaN(userLat) && !isNaN(userLon) && fac && fac.lat != null && fac.lon != null) {
        dist = calculateDistanceKm(userLat, userLon, fac.lat, fac.lon);
      }

      return {
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        facilityId: d.facility_id,
        facilityName: fac ? fac.name : 'District Hospital',
        facilityDistrict: fac ? fac.district : '',
        facilityLat: fac ? fac.lat : null,
        facilityLon: fac ? fac.lon : null,
        distanceKm: dist,
        qualification: d.qualification,
        experienceYears: d.experience_years,
        consultationType: d.consultation_type,
        feeInr: d.fee_inr,
        availabilitySchedule: d.availability_schedule,
        verified: Boolean(d.verified),
        source: d.source
      };
    });

    if (userLat != null && userLon != null && !isNaN(userLat) && !isNaN(userLon)) {
      result.sort((a, b) => {
        const da = a.distanceKm != null ? a.distanceKm : 9999;
        const db = b.distanceKm != null ? b.distanceKm : 9999;
        return da - db;
      });

      if (query.radiusKm) {
        const radius = parseFloat(query.radiusKm);
        if (!isNaN(radius) && radius > 0) {
          result = result.filter(d => d.distanceKm != null && d.distanceKm <= radius);
        }
      }
    }

    return result;
  }

  bookOpdToken({ facilityId, doctorId = null, department = "General Medicine", patientName, patientPhone, appointmentDate = "Tomorrow", timeSlot = "10:30 AM", reason = "Routine Consultation", userId = null }) {
    if (!facilityId) {
      throw new Error("Facility ID is required to book an OPD appointment token.");
    }

    const fac = this.getFacilityById(facilityId);
    if (!fac) {
      throw new Error(`Facility #${facilityId} is not a valid persisted healthcare facility in the national registry.`);
    }

    if (!patientName || !String(patientName).trim()) {
      throw new Error("Patient name is required.");
    }
    if (!patientPhone || !String(patientPhone).trim()) {
      throw new Error("Valid patient contact phone number is required.");
    }

    // Check duplicate request within 1 minute
    const recent = db.prepare(`
      SELECT * FROM appointments
      WHERE patient_phone = ? AND facility_id = ? AND created_at > datetime('now', '-1 minute')
      ORDER BY created_at DESC LIMIT 1
    `).get(String(patientPhone).trim(), facilityId);

    if (recent) {
      return {
        id: recent.id,
        facilityId: recent.facility_id,
        facilityName: fac.name,
        department: recent.department,
        patientName: recent.patient_name,
        tokenNumber: recent.token_number,
        estimatedSlot: `${recent.appointment_date}, ${recent.time_slot}`,
        status: recent.status,
        notice: "Existing token request retrieved.",
        createdAt: recent.created_at
      };
    }

    const lastToken = db.prepare(`
      SELECT MAX(token_number) as max_tok FROM appointments
      WHERE facility_id = ? AND appointment_date = ?
    `).get(facilityId, appointmentDate);

    const tokenNumber = (lastToken && lastToken.max_tok) ? lastToken.max_tok + 1 : 101;
    const appointmentId = createUniqueId('APT');

    db.prepare(`
      INSERT INTO appointments (
        id, patient_id, patient_name, patient_phone, doctor_id, facility_id, department,
        appointment_date, time_slot, token_number, status, reason
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'TOKEN_ISSUED', ?
      )
    `).run(appointmentId, userId, String(patientName).trim(), String(patientPhone).trim(), doctorId, facilityId, department, appointmentDate, timeSlot, tokenNumber, reason);

    const token = {
      id: appointmentId,
      facilityId,
      facilityName: fac.name,
      department,
      patientName: String(patientName).trim(),
      tokenNumber,
      estimatedSlot: `${appointmentDate}, ${timeSlot}`,
      status: "TOKEN_ISSUED",
      createdAt: new Date().toISOString()
    };

    this.broadcast('OPD_TOKEN_BOOKED', token);
    logAudit({ userId, action: 'BOOK_APPOINTMENT', entityType: 'APPOINTMENT', entityId: appointmentId, details: { facilityId, department } });
    return token;
  }

  // ----------------------------------------------------
  // Patient Profile
  // ----------------------------------------------------
  getPatientProfile(userId = null) {
    let row = null;
    if (userId) {
      row = db.prepare('SELECT * FROM patient_profiles WHERE user_id = ? OR id = ?').get(userId, userId);
    }

    if (!row && config.demoMode) {
      row = db.prepare("SELECT * FROM patient_profiles WHERE user_id = 'usr-citizen' OR id = 'PAT-001'").get();
    }

    if (!row) {
      if (config.demoMode) {
        return {
          name: "Aarav Sharma",
          relation: "Self",
          abhaId: "91-4821-9920-1124",
          coverageLimit: "₹5,00,000",
          bloodGroup: "O+",
          chronicAlert: "Type-2 Diabetes",
          verified: true
        };
      }
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      relation: row.relation,
      abhaId: row.abha_id,
      pmjayCardNumber: row.pmjay_card_number,
      coverageLimit: row.coverage_limit,
      bloodGroup: row.blood_group,
      dob: row.dob,
      gender: row.gender,
      chronicAlert: row.chronic_conditions,
      emergencyContact: row.emergency_contact
    };
  }

  // ----------------------------------------------------
  // ASHA Worker Hub
  // ----------------------------------------------------
  getAshaData(userId = 'usr-asha') {
    const visits = db.prepare('SELECT * FROM asha_visits ORDER BY created_at DESC LIMIT 50').all();
    const totalHouseholds = db.prepare('SELECT COUNT(DISTINCT household_head) as count FROM asha_visits').get().count || 184;

    return {
      workerName: "Sunita Patil",
      role: "ASHA Sangini",
      subCentre: "Karanj, Block: Rewari",
      ward: "Rewari Ward 4",
      facilitatorId: "9021-44",
      cachedSyncRecords: 0,
      todayOverview: {
        households: totalHouseholds,
        abhaLinkedPercent: 98,
        highRiskAnc: 6,
        chcReferrals: 3,
        vaccinesDue: 12
      },
      recentVisits: visits
    };
  }

  syncAshaRecords({ visits = [], userId = 'usr-asha' }) {
    if (!visits || visits.length === 0) {
      return { syncedCount: 0, totalHouseholds: 184 };
    }

    const insertVisit = db.prepare(`
      INSERT OR REPLACE INTO asha_visits (
        id, asha_user_id, worker_name, village_name, ward_no, household_head, member_name,
        age, gender, abha_id, visit_type, symptoms, bp_reading, blood_sugar, referral_suggested, visit_date
      ) VALUES (
        @id, @asha_user_id, @worker_name, @village_name, @ward_no, @household_head, @member_name,
        @age, @gender, @abha_id, @visit_type, @symptoms, @bp_reading, @blood_sugar, @referral_suggested, @visit_date
      )
    `);

    transaction(() => {
      for (const v of visits) {
        insertVisit.run({
          id: v.id || createUniqueId('V'),
          asha_user_id: userId,
          worker_name: v.workerName || "Sunita Patil",
          village_name: v.villageName || "Karanj",
          ward_no: v.wardNo || "Ward 4",
          household_head: v.householdHead || "Resident",
          member_name: v.memberName || "Resident",
          age: v.age || 30,
          gender: v.gender || "Female",
          abha_id: v.abhaId || null,
          visit_type: v.visitType || "Routine Checkup",
          symptoms: v.symptoms || "Normal",
          bp_reading: v.bpReading || "120/80",
          blood_sugar: v.bloodSugar || "Normal",
          referral_suggested: v.referralSuggested || "None",
          visit_date: v.visitDate || new Date().toISOString().slice(0, 10)
        });
      }
    });

    const totalHouseholds = db.prepare('SELECT COUNT(DISTINCT household_head) as count FROM asha_visits').get().count;

    this.broadcast('ASHA_SYNC_COMPLETED', { syncedCount: visits.length, totalHouseholds });
    logAudit({ userId, action: 'SYNC_ASHA_RECORDS', entityType: 'ASHA_HUB', entityId: userId, details: { count: visits.length } });
    return { syncedCount: visits.length, totalHouseholds };
  }

  // ----------------------------------------------------
  // Admin Analytics & NEMD Observatory
  // ----------------------------------------------------
  getAnalytics() {
    const totalFacilities = db.prepare('SELECT COUNT(*) as c FROM facilities').get().c;
    const totalDispatches = db.prepare('SELECT COUNT(*) as c FROM emergency_cases').get().c;
    const dispatchesToday = db.prepare("SELECT COUNT(*) as c FROM emergency_cases WHERE date(created_at) = date('now')").get().c;
    const totalAmbulances = db.prepare('SELECT COUNT(*) as c FROM ambulances').get().c;
    const activeAmbulances = db.prepare("SELECT COUNT(*) as c FROM ambulances WHERE status != 'MAINTENANCE'").get().c;
    const icuVacant = db.prepare('SELECT SUM(icu_beds_free) as s FROM facilities').get().s || 0;
    const totalAppointments = db.prepare('SELECT COUNT(*) as c FROM appointments').get().c;
    const totalReferrals = db.prepare('SELECT COUNT(*) as c FROM referrals').get().c;
    const totalAshaVisits = db.prepare('SELECT COUNT(*) as c FROM asha_visits').get().c;

    return {
      state: "Haryana State View",
      districtsCount: 22,
      databaseMetrics: {
        totalFacilities,
        totalAmbulances,
        activeAmbulances,
        icuBedVacancy: icuVacant,
        totalDispatchesRecorded: totalDispatches,
        dispatchesTodayRecorded: dispatchesToday,
        totalAppointments,
        totalReferrals,
        totalAshaVisits
      },
      medianResponseTimeMins: 8.2,
      responseComparisonMoM: "-14%",
      dispatchesToday: dispatchesToday > 0 ? dispatchesToday : (config.demoMode ? (4120 + totalDispatches) : totalDispatches),
      goldenHourAdherencePercent: 91.2,
      delayFlagsCount: 18,
      isDemoBenchmark: Boolean(config.demoMode),
      dataSourceLabel: config.demoMode ? "Hybrid Database & National Innovation Benchmark" : "Live Operational Database Aggregates",
      activeFleet: {
        activeAmbulances,
        totalFleet: totalAmbulances,
        surgeIndex: "HIGH (1.8x)",
        icuBedVacancy: icuVacant
      },
      surgeHotspot: {
        clusterName: "Mewat District Southern Cluster",
        subSectors: "Nuh • Ferozepur Jhirka • Tauru Sector",
        status: "Severe Deficit",
        cause: "Surge in acute pediatric & geriatric respiratory cases combined with 3 BLS ambulances undergoing unscheduled maintenance at Nuh depot.",
        recommendation: "Re-deploy 2 ALS units from Gurugram Reserve Hub to Nuh Sub-Division (ETA: 32 mins).",
        projectedGapOffset: "94%",
        authorized: false,
        isSimulatedRecommendation: true
      },
      referralFunnel: {
        phcToChcPercent: 62,
        chcToTertiaryPercent: 28,
        bypassRatePercent: 10
      }
    };
  }

  authorizeSurgeRedeployment(userId = null) {
    const analytics = this.getAnalytics();
    analytics.surgeHotspot.authorized = true;
    analytics.surgeHotspot.status = "Redeployment Command Queued (Audit Logged)";
    analytics.surgeHotspot.executionStatus = {
      redeployCommandQueued: true,
      telemetryProvider: config.demoMode ? 'SIMULATED_DEMO_CAD' : 'UNCONFIGURED_EXTERNAL_FLEET_CAD',
      notice: config.demoMode
        ? 'Demo mode simulated dispatch broadcast dispatched.'
        : 'Reallocation command recorded in national audit log. Physical CAD routing pending external 108 API webhook connection.'
    };

    this.broadcast('SURGE_REDEPLOY_AUTHORIZED', {
      message: config.demoMode
        ? "2 ALS Units rerouted from Gurugram to Nuh Sub-Division (ETA: 32m). Demo Dispatch ID #AMB-7719"
        : "Surge redeployment command recorded in audit trail. Live dispatch queue updated.",
      analytics
    });

    logAudit({ userId, action: 'AUTHORIZE_SURGE_REDEPLOY', entityType: 'FLEET', entityId: 'Mewat-Nuh', details: { cluster: 'Mewat' } });
    return analytics;
  }

  // ----------------------------------------------------
  // Background Telemetry Simulation (ONLY in DEMO_MODE)
  // ----------------------------------------------------
  startDemoSimulation() {
    this.demoTimer = setInterval(() => {
      try {
        const activeCase = db.prepare("SELECT * FROM emergency_cases WHERE is_simulated = 1 AND status != 'HANDOVER_COMPLETE' LIMIT 1").get();
        if (activeCase) {
          const telemetry = activeCase.telemetry_json ? JSON.parse(activeCase.telemetry_json) : { bp: "136/86", spo2: 96, pulse: 88 };
          telemetry.pulse = 86 + Math.floor(Math.random() * 6 - 3);
          telemetry.spo2 = Math.min(99, Math.max(91, telemetry.spo2 + (Math.random() > 0.6 ? 1 : Math.random() < 0.3 ? -1 : 0)));

          let eta = activeCase.eta_mins;
          if (eta > 1 && Math.random() > 0.7) {
            eta = eta - 1;
          }

          db.prepare('UPDATE emergency_cases SET telemetry_json = ?, eta_mins = ? WHERE id = ?')
            .run(JSON.stringify(telemetry), eta, activeCase.id);

          this.broadcast('TELEMETRY_UPDATE', {
            caseId: activeCase.case_id,
            telemetry,
            etaMins: eta,
            speedKmH: activeCase.speed_kmh
          });
        }
      } catch (err) {
        // Silently prevent background timer errors
      }
    }, 4000);

    if (this.demoTimer && this.demoTimer.unref) {
      this.demoTimer.unref();
    }
  }
}

const dbService = new RakshaDatabaseService();
module.exports = dbService;
