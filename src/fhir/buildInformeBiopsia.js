export const R2BO_INFORME_BIOPSIA_PROFILE =
  "https://interoperabilidad.minsal.cl/fhir/ig/r2bo/StructureDefinition/r2bo-informe-biopsia";

export function buildInformeBiopsia({
  subjectRef,
  basedOnRef,
  specimenRef,
  issued,
  conclusion,
}) {
  if (!subjectRef) throw new Error("subject es obligatorio");
  if (!specimenRef) throw new Error("specimen es obligatorio");

  return {
    resourceType: "DiagnosticReport",
    meta: {
      profile: [R2BO_INFORME_BIOPSIA_PROFILE],
    },

    status: "final",

    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/v2-0074",
        code: "PAT",
        display: "Pathology"
      }]
    }],

    code: {
      text: "Informe Anatomía Patológica – Biopsia"
    },

    subject: {
      reference: subjectRef
    },

    ...(basedOnRef ? {
      basedOn: [{ reference: basedOnRef }]
    } : {}),

    specimen: [{
      reference: specimenRef
    }],

    issued,

    conclusion
  };
}