// public/js/screens/screen2_patient.js
// Screen 2: Patient Health Dashboard

function renderScreen2(state) {
  const p = state.patientProfile || {
    name: "Aarav Sharma",
    relation: "Self",
    abhaId: "91-4821-9920-1124",
    coverageLimit: "₹5,00,000",
    bloodGroup: "O+",
    chronicAlert: "Diabetic Alert"
  };
  const isHi = state.language === 'HI';

  return `
    <div class="flex flex-col w-full pb-8">
      <!-- Offline Sync Micro-Banner -->
      <div class="px-margin-mobile pt-space-xs pb-space-sm flex items-center justify-between">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant shadow-sm">
          <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Last synced: 4 mins ago · Cached for offline view</span>
        </div>
        <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wider">Demo Mode</span>
      </div>

      <!-- Patient Identity Card -->
      <div class="px-margin-mobile">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
          <div class="flex items-start justify-between gap-space-sm pt-1">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="relative shrink-0">
                <img class="w-13 h-13 rounded-full object-cover shadow-sm bg-surface-container keep-image" alt="Portrait of Aarav Sharma" src="/images/patient_aarav.jpg" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCi9mV-jnpnMeb3cdIYAC0LBcDfSshV3bo5IGtss9ZdGKgFLTzqSJuz73E3G3ma5XcFAG4zwlBMoYDaXMtAKCXx8TDlyxkOtPHF16YUsiLPq9t0PcN73LXkWxKuurfHoMGbYEYIfeWQQziqvBmfKRd-tDTuxQuWvGlPu44MIh1hGkqJ6uuDUQKRpLD-S4rO9AGAIK-A181uvZ84u4hPYOMPuylAkdUWYxdsX9RSrC7NWp8AYWwO2nZcOg';" style="width: 52px; height: 52px;"/>
                <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-[12px] text-on-primary" style="font-variation-settings: 'FILL' 1;">verified</span>
                </div>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">${p.name}</h2>
                  <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-primary-container font-label-sm text-label-sm font-semibold">${p.relation}</span>
                </div>
                <div class="flex items-center gap-1 text-on-surface-variant font-code-data text-code-data">
                  <span class="font-medium text-primary">ABHA</span>
                  <span id="abhaNumberDisplay">${p.abhaId}</span>
                  <button aria-label="Copy ABHA ID" class="text-on-surface-variant hover:text-primary active:scale-95 transition-transform ml-0.5 p-0.5 cursor-pointer" onclick="copyAbhaId('${p.abhaId}')" type="button">
                    <span class="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
            <button aria-label="Scan QR Code / Share Profile" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-transform shrink-0 cursor-pointer" onclick="showQrModal('${p.name}', '${p.abhaId}')" type="button">
              <span class="material-symbols-outlined text-[20px]">qr_code_2</span>
            </button>
          </div>

          <!-- Ayushman PM-JAY Coverage Tier -->
          <div class="mt-space-md pt-space-sm bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
                <span class="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-label-md text-label-md text-on-surface font-semibold truncate">Ayushman Card Active</span>
                  <span class="font-label-sm text-label-sm px-1.5 rounded bg-surface-container-high text-on-surface-variant">PM-JAY</span>
                </div>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Annual Family Protection</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="font-label-sm text-label-sm text-on-secondary-container font-bold block">Coverage Limit</span>
              <span class="font-title-md text-title-md text-secondary font-bold">${p.coverageLimit}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Status Metric Chips -->
      <div class="mt-space-md px-margin-mobile">
        <div class="grid grid-cols-3 gap-2">
          <!-- Item 1: OPD -->
          <div class="bg-surface-container-lowest p-2.5 rounded-lg shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-primary">
              <span class="material-symbols-outlined text-[18px]">calendar_today</span>
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            </div>
            <div class="mt-2">
              <span class="font-label-sm text-label-sm text-on-surface-variant block uppercase font-medium">Next OPD</span>
              <p class="font-label-md text-label-md text-on-surface font-bold truncate">Tomorrow</p>
              <p class="font-label-sm text-label-sm text-primary font-semibold">10:30 AM</p>
            </div>
          </div>
          <!-- Item 2: Active Referral -->
          <div class="bg-surface-container-lowest p-2.5 rounded-lg shadow-sm flex flex-col justify-between cursor-pointer" onclick="window.rakshaState.setScreen('screen-6')">
            <div class="flex items-center justify-between text-secondary">
              <span class="material-symbols-outlined text-[18px]">alt_route</span>
              <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            </div>
            <div class="mt-2">
              <span class="font-label-sm text-label-sm text-on-surface-variant block uppercase font-medium">Referral</span>
              <p class="font-label-md text-label-md text-on-surface font-bold truncate">AIIMS Delhi</p>
              <p class="font-label-sm text-label-sm text-secondary font-semibold">Cardiology</p>
            </div>
          </div>
          <!-- Item 3: Prescriptions -->
          <div class="bg-surface-container-lowest p-2.5 rounded-lg shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-on-surface-variant">
              <span class="material-symbols-outlined text-[18px]">medication</span>
              <span class="font-label-sm text-label-sm px-1 rounded-full bg-surface-container font-bold text-on-surface">2</span>
            </div>
            <div class="mt-2">
              <span class="font-label-sm text-label-sm text-on-surface-variant block uppercase font-medium">Rx Meds</span>
              <p class="font-label-md text-label-md text-on-surface font-bold truncate">2 Active</p>
              <p class="font-label-sm text-label-sm text-on-surface-variant font-medium">Refill in 4d</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Journey Tracker: Active Referral #REF-2025-084 -->
      <div class="mt-space-md px-margin-mobile">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between mb-space-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              <span class="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">Live Triage & Transfer</span>
            </div>
            <span class="font-code-data text-code-data px-2 py-0.5 rounded bg-surface-container font-semibold text-on-surface cursor-pointer" onclick="window.rakshaState.setScreen('screen-6')">#REF-2025-084</span>
          </div>
          <div class="mt-space-xs">
            <h3 class="font-title-md text-title-md text-on-surface font-bold">Cardiology Evaluation Forwarded</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Sub-District Hospital Rewari <span class="text-primary font-semibold">➔</span> AIIMS New Delhi (Cardiology OPD)
            </p>
          </div>
          <!-- Progress Stepper (Step 3 of 5) -->
          <div class="mt-space-sm pt-space-xs">
            <div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-1.5">
              <span class="font-semibold text-primary">Step 3 of 5: Hospital Bed Allocated</span>
              <span class="font-bold text-on-surface">60%</span>
            </div>
            <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
              <div class="bg-primary h-full rounded-full transition-all duration-500" style="width: 60%"></div>
            </div>
            <div class="flex justify-between items-center mt-2 font-label-sm text-label-sm text-on-surface-variant">
              <span class="text-primary font-semibold flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[13px]">check_circle</span> Initiated
              </span>
              <span class="text-primary font-semibold flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[13px]">check_circle</span> SDH Cleared
              </span>
              <span class="text-primary font-bold flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[13px]">radio_button_checked</span> AIIMS Queued
              </span>
              <span class="text-outline-variant">Transit</span>
              <span class="text-outline-variant">Admitted</span>
            </div>
          </div>
          <!-- Transit Voucher Perk Pill -->
          <div class="mt-space-sm p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary text-[20px]">directions_bus</span>
              <div class="flex flex-col">
                <span class="font-label-md text-label-md text-on-surface font-bold">Transit Transport Voucher</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">108 Inter-Facility Shuttle Approved</span>
              </div>
            </div>
            <span class="font-label-sm text-label-sm font-bold text-secondary bg-surface-container-lowest px-2 py-1 rounded shadow-sm">PASS #8841</span>
          </div>
        </div>
      </div>

      <!-- Medical Safety & Emergency Micro-Bar -->
      <div class="mt-space-md px-margin-mobile">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <div class="flex items-center justify-between mb-space-xs">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-error text-[18px]">medical_information</span>
              <span class="font-label-lg text-label-lg font-bold text-on-surface">Critical Vitals & Emergency Alert</span>
            </div>
            <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">${p.chronicAlert}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center font-headline-sm text-headline-sm text-tertiary font-bold shrink-0">
                ${p.bloodGroup}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm text-on-surface-variant">Blood Group</span>
                <span class="font-label-md text-label-md text-on-surface font-bold truncate">O-Positive (Verified)</span>
              </div>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2.5 cursor-pointer" onclick="logDial('Sunita (Spouse)')">
              <div class="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined text-[20px]">contact_phone</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm text-on-surface-variant">Emergency ICE</span>
                <span class="font-label-md text-label-md text-on-surface font-bold truncate">${p.emergencyContact ? p.emergencyContact.name : 'Sunita (Spouse)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Primary Health Services Hub -->
      <div class="mt-space-md px-margin-mobile">
        <div class="flex items-center justify-between mb-space-xs">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Health Services</h3>
          <span class="font-label-sm text-label-sm text-on-surface-variant">Govt Portals Connected</span>
        </div>
        <div class="grid grid-cols-1 gap-space-sm">
          <!-- Card 1: OPD Appointments -->
          <div class="block bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="window.rakshaState.setScreen('screen-3')">
            <div class="flex items-start gap-space-sm">
              <div class="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[26px]">local_hospital</span>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <h4 class="font-title-md text-title-md text-on-surface font-bold truncate">OPD / Doctor Appointments</h4>
                  <span class="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                  Civil Hospital Rewari, CHC Bawal & District Hospitals
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">Free Queue Token</span>
                  <span class="font-label-sm text-label-sm text-primary font-semibold">Slot booked for tomorrow</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: eSanjeevani Tele-Consult -->
          <div class="block bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="showTeleconsultModal()">
            <div class="flex items-start gap-space-sm">
              <div class="w-12 h-12 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[26px]">video_call</span>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <h4 class="font-title-md text-title-md text-on-surface font-bold truncate">Tele-Consult & Diagnostics</h4>
                  <span class="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                  National Telemedicine Service (eSanjeevani 2.0 Integration)
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">Avg wait: 4 mins</span>
                  <span class="font-label-sm text-label-sm text-secondary font-bold">General Physician Online</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: ABHA Health Records -->
          <div class="block bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:bg-surface-container-low" onclick="showNotificationToast('ABHA Locker: 3 records fully synchronized with ABDM gateway.')">
            <div class="flex items-start gap-space-sm">
              <div class="w-12 h-12 rounded-xl bg-surface-container-highest text-secondary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[26px]">folder_shared</span>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <h4 class="font-title-md text-title-md text-on-surface font-bold truncate">ABHA Health Records</h4>
                  <span class="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                  Diagnostic tests, ECG charts, and discharge summaries
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-primary-container font-semibold">3 New Synced</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant">ECG, Lipid Profile, Blood Glucose</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Doctor Directory & Specialist Booking -->
      <div class="mt-space-md px-margin-mobile">
        <div class="flex items-center justify-between mb-space-xs">
          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Doctor Specialists</h3>
            <p class="font-label-sm text-label-sm text-on-surface-variant">Verified National Medical Commission Registry</p>
          </div>
          <span class="font-label-sm text-label-sm text-primary font-bold">${(state.doctors && state.doctors.length) || 6} Available</span>
        </div>

        <div class="flex flex-col gap-2.5">
          ${((state.doctors && state.doctors.length > 0) ? state.doctors.slice(0, 4) : [
            { id: "doc-1", name: "Dr. Vikram Sen", specialty: "General Medicine", facilityName: "Safdarjung Hospital", qualification: "MD (General Medicine)", feeInr: 0, availabilitySchedule: "Mon-Sat: 09:00 AM - 02:00 PM" },
            { id: "doc-2", name: "Dr. Rajesh K. Verma", specialty: "Cardiology", facilityName: "Safdarjung Hospital", qualification: "DM (Cardiology)", feeInr: 0, availabilitySchedule: "Mon-Fri: 10:00 AM - 03:00 PM" }
          ]).map(doc => `
            <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[14px] shrink-0">
                  <span class="material-symbols-outlined text-[20px]">stethoscope</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-label-md text-label-md font-bold text-on-surface truncate">${doc.name}</span>
                    <span class="font-label-sm text-label-sm px-1.5 py-0.2 rounded bg-surface-container text-primary font-semibold text-[10px]">${doc.specialty}</span>
                  </div>
                  <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${doc.qualification} • ${doc.facilityName}</span>
                  <span class="font-label-sm text-label-sm text-secondary font-medium text-[11px]">${doc.availabilitySchedule || 'Mon-Sat 10:00 AM'}</span>
                </div>
              </div>
              <button class="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-sm active:scale-95 transition-transform cursor-pointer" onclick="showAppointmentModal('${doc.facilityId || 'safdarjung'}', '${doc.facilityName || 'Safdarjung Hospital'}')">
                Book OPD
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Synced Diagnostic Reports -->
      <div class="mt-space-md px-margin-mobile">
        <div class="flex items-center justify-between mb-space-xs">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Recent Records</h3>
          <span class="font-label-md text-label-md text-primary font-bold flex items-center cursor-pointer" onclick="showNotificationToast('All 8 digital clinical records verified.')">
            View All (8) <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </div>
        <div class="flex gap-space-sm overflow-x-auto pb-2 -mx-margin-mobile px-margin-mobile scrollbar-none">
          <!-- Report 1 -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm shrink-0 w-60 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="material-symbols-outlined text-primary text-[20px]">ecg_heart</span>
                <span class="font-label-sm text-label-sm px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">PDF · 1.2 MB</span>
              </div>
              <h5 class="font-label-lg text-label-lg text-on-surface font-bold truncate">12-Lead ECG Report</h5>
              <p class="font-label-sm text-label-sm text-on-surface-variant truncate">SDH Rewari Cardiology Unit</p>
            </div>
            <div class="mt-3 pt-2 bg-surface-container-low rounded p-1.5 flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">14 Oct 2025</span>
              <button class="font-label-sm text-label-sm text-primary font-bold flex items-center gap-0.5 cursor-pointer hover:underline" onclick="showNotificationToast('Downloading 12-Lead ECG PDF...')">
                <span class="material-symbols-outlined text-[12px]">download</span> Sync
              </button>
            </div>
          </div>

          <!-- Report 2 -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm shrink-0 w-60 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="material-symbols-outlined text-secondary text-[20px]">bloodtype</span>
                <span class="font-label-sm text-label-sm px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">PDF · 840 KB</span>
              </div>
              <h5 class="font-label-lg text-label-lg text-on-surface font-bold truncate">HbA1c & Fasting Glucose</h5>
              <p class="font-label-sm text-label-sm text-on-surface-variant truncate">CHC Bawal Central Pathology</p>
            </div>
            <div class="mt-3 pt-2 bg-surface-container-low rounded p-1.5 flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">11 Oct 2025</span>
              <button class="font-label-sm text-label-sm text-primary font-bold flex items-center gap-0.5 cursor-pointer hover:underline" onclick="showNotificationToast('Downloading HbA1c Lab Report...')">
                <span class="material-symbols-outlined text-[12px]">download</span> Sync
              </button>
            </div>
          </div>

          <!-- Report 3 -->
          <div class="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm shrink-0 w-60 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="material-symbols-outlined text-on-surface-variant text-[20px]">prescriptions</span>
                <span class="font-label-sm text-label-sm px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">ABHA Link</span>
              </div>
              <h5 class="font-label-lg text-label-lg text-on-surface font-bold truncate">OPD Digital Slip #4902</h5>
              <p class="font-label-sm text-label-sm text-on-surface-variant truncate">Dr. R. K. Verma (Cardiologist)</p>
            </div>
            <div class="mt-3 pt-2 bg-surface-container-low rounded p-1.5 flex items-center justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">09 Oct 2025</span>
              <button class="font-label-sm text-label-sm text-primary font-bold flex items-center gap-0.5 cursor-pointer hover:underline" onclick="showNotificationToast('Downloading OPD Digital Slip...')">
                <span class="material-symbols-outlined text-[12px]">download</span> Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Frontline ASHA / Community Connect Card -->
      <div class="mt-space-md px-margin-mobile">
        <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm">
          <div class="flex items-center gap-space-sm min-w-0">
            <img class="w-11 h-11 rounded-full object-cover shrink-0 bg-surface-container keep-image" alt="Portrait of ASHA Sangini Meena Devi" src="/images/asha_meena.jpg" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCK3tTJGMMBAp2NffKA_T4J-XL6XFuOqUoxsFe3zJefqMhRUUNM9juB885p5d4l4v-Z9yxFM6hF78YOBtUsX1zsTMSZAQyhZ85oMECT9Te1rYK614qxUACd1VkcsIikpKAd9ZDVKrrDpmCTYu_wMAfRwxiPTZb-DIC9Om2XaUmaLoRpzaFLp6I3ij4nLGXVhwcel3v7p2k5h09EwY87UsATIrVcb5jCi68l9DrHLhEOdsUtV8cFBU9fXw';"/>
            <div class="flex flex-col min-w-0">
              <span class="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Assigned ASHA Sangini</span>
              <span class="font-title-md text-title-md text-on-surface font-bold truncate">Meena Devi</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">Sector 4, Rewari · Next visit in 3 days</span>
            </div>
          </div>
          <a class="h-10 px-3 rounded-lg bg-surface-container-low text-primary flex items-center gap-1 font-label-md text-label-md font-bold active:scale-95 transition-transform shrink-0" href="tel:108" onclick="logDial('ASHA Meena Devi')">
            <span class="material-symbols-outlined text-[18px]">call</span> Call
          </a>
        </div>
      </div>

      <!-- Institutional Watermark & Legal Disclaimer Footer -->
      <div class="mt-space-lg px-margin-mobile text-center">
        <div class="flex items-center justify-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
          <span class="material-symbols-outlined text-[15px] text-primary">security</span>
          <span>Secured via National Digital Health Mission (ABDM) protocols</span>
        </div>
        <p class="font-label-sm text-label-sm text-on-surface-variant opacity-75 mt-1">
          Simulated citizen portal demonstration · RAKSHA Health Public Delivery System
        </p>
      </div>
    </div>
  `;
}

window.renderScreen2 = renderScreen2;
