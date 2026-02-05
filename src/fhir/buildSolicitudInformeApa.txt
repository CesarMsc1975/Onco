// src/fhir/buildSolicitudInformeApa.js

export const R2BO_SOLICITUD_APA_PROFILE =
  "https://interoperabilidad.minsal.cl/fhir/ig/r2bo/StructureDefinition/r2bo-solicitud-informe-apa";

// En ejemplos del IG: SNOMED CT 116784002 ("Informe de Biopsia") :contentReference[oaicite:1]{index=1}
const FIXED_CODE = (displayText) => ({
  coding: [
    {
      system: "http://snomed.info/sct",
      code: "116784002",
      ...(displayText ? { display: displayText } : {}),
    },
  ],
  ...(displayText ? { text: displayText } : {}),
});

const trim = (v) => String(v ?? "").trim();

function parseReasonCode(input) {
  const raw = trim(input);
  if (!raw) return null;

  // Permite: "system|code|display" (opcional)
  if (raw.includes("|")) {
    const [system, code, display] = raw.split("|").map((s) => s.trim());
    if (system && code) {
      return {
        coding: [{ system, code, ...(display ? { display } : {}) }],
        ...(display ? { text: display } : {}),
      };
    }
  }

  // Si no viene con "|", lo dejamos como texto libre.
  return { text: raw };
}

function parseSpecimenList(input) {
  const raw = trim(input);
  if (!raw) return [];
  // Acepta: "Specimen/1, Specimen/2"
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((ref) => ({ reference: ref }));
}

/**
 * Construye ServiceRequest conforme al perfil r2bo-solicitud-informe-apa.
 * - subjectRef: se fija con Patient/{id} del paciente activo (como TNM).
 * - requester / performer / specimen: manual (el usuario pone los ids).
 */
export function buildSolicitudInformeApa({
  status,
  intent,
  codeText,        // opcional: lo usaremos como display/text (pero el code SNOMED es fijo)
  subjectRef,      // "Patient/123"
  requesterRef,    // "PractitionerRole/..."
  performerRef,    // "Organization/..." o "PractitionerRole/..."
  reasonCode,      // texto o "system|code|display"
  specimen,        // "Specimen/1, Specimen/2"
}) {
  const sr = {
    resourceType: "ServiceRequest",
    meta: { profile: [R2BO_SOLICITUD_APA_PROFILE] },
    status: trim(status),
    intent: trim(intent),
    code: FIXED_CODE(trim(codeText)), // code fijo (SNOMED 116784002) :contentReference[oaicite:2]{index=2}
    subject: { reference: trim(subjectRef) },
    requester: { reference: trim(requesterRef) },
    performer: [{ reference: trim(performerRef) }],
    reasonCode: [],
    specimen: [],
  };

  const rc = parseReasonCode(reasonCode);
  if (rc) sr.reasonCode.push(rc);

  const sp = parseSpecimenList(specimen);
  if (sp.length) sr.specimen = sp;

  // Limpieza: si aún no llenan, no mandamos vacío (pero ojo: el perfil exige reasonCode y specimen)
  if (!sr.reasonCode.length) delete sr.reasonCode;
  if (!sr.specimen.length) delete sr.specimen;

  return sr;
}