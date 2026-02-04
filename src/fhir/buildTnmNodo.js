// src/fhir/buildTnmNodo.js
export function buildTnmNodoRegional({ basedOnRef, status, subjectRef }) {
  return {
    resourceType: "Observation",
    meta: {
      profile: [
        "https://interoperabilidad.minsal.cl/fhir/ig/r2bo/StructureDefinition/r2bo-tnm-categoria-nodo-regional"
      ]
    },
    basedOn: [{ reference: basedOnRef }],
    status,
    subject: { reference: subjectRef },
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "371494008",
          display: "Stage of tumour involvement of regional lymph nodes"
        }
      ]
    }
  };
}