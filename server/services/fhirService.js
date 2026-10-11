// server/services/fhirService.js
// Generates HL7 FHIR Release 4 compliant JSON Bundles for ABDM & Inter-Facility Referrals

/**
 * Builds a validated FHIR R4 Bundle for an Emergency / FastTrack Referral
 * @param {object} referral - Referral record with patient and facility details
 * @returns {object} FHIR R4 Bundle
 */
function generateReferralFhirBundle(referral) {
  const timestamp = new Date().toISOString();
  const bundleId = `raksha-fhir-${referral.ref_id || referral.refId || Date.now()}`;
  const refId = referral.ref_id || referral.refId || 'REF-GEN';

  return {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      versionId: "1",
      lastUpdated: timestamp,
      profile: [
        "https://nrces.in/ndhm/fhir/r4/StructureDefinition/ServiceRequestBundle"
      ]
    },
    identifier: {
      system: "https://healthid.ndhm.gov.in/referral",
      value: refId
    },
    type: "collection",
    timestamp: timestamp,
    entry: [
      // 1. Patient Resource
      {
        fullUrl: `urn:uuid:patient-${refId}`,
        resource: {
          resourceType: "Patient",
          id: `patient-${refId}`,
          meta: {
            profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
          },
          identifier: [
            {
              system: "https://healthid.ndhm.gov.in",
              value: referral.abha_id || referral.abhaId || "UNLINKED-CITIZEN"
            }
          ],
          active: true,
          name: [
            {
              use: "official",
              text: referral.patient_name || referral.patientName || "Citizen"
            }
          ],
          gender: (referral.patient_gender || referral.patientGender || "unknown").toLowerCase(),
          extension: [
            {
              url: "https://pmjay.gov.in/extension/beneficiary-status",
              valueBoolean: Boolean(referral.pmjay_eligible || referral.pmjay)
            }
          ]
        }
      },
      // 2. ServiceRequest Resource (The clinical referral request)
      {
        fullUrl: `urn:uuid:servicerequest-${refId}`,
        resource: {
          resourceType: "ServiceRequest",
          id: `servicerequest-${refId}`,
          meta: {
            profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/ServiceRequest"]
          },
          status: referral.status === 'ADMITTED' ? 'completed' : 'active',
          intent: "order",
          priority: (referral.priority || 'stat').toLowerCase() === 'critical' ? 'stat' : 'urgent',
          code: {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "3457005",
                display: referral.reason || "Patient referral for emergency evaluation"
              }
            ],
            text: referral.reason || "Inter-Facility Emergency Transfer"
          },
          subject: {
            reference: `urn:uuid:patient-${refId}`,
            display: referral.patient_name || referral.patientName
          },
          authoredOn: referral.created_at || timestamp,
          requester: {
            display: referral.originFacilityName || referral.origin_facility_id || "Referring Facility"
          },
          performer: [
            {
              display: referral.receivingFacilityName || referral.receiving_facility_id || "Receiving Facility"
            }
          ],
          reasonCode: [
            {
              text: referral.reason || "Emergency Cardiac / Trauma Triage"
            }
          ]
        }
      }
    ]
  };
}

module.exports = {
  generateReferralFhirBundle
};
