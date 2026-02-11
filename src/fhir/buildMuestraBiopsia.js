// src/fhir/buildMuestraBiopsia.js

export const R2BO_MUESTRA_BIOPSIA_PROFILE =
  "https://interoperabilidad.minsal.cl/fhir/ig/r2bo/StructureDefinition/r2bo-muestra-biopsia";

// Según ejemplo oficial de R2BO, estas extensiones se usan así:
export const EXT_TIPO_PROCED_BIOPSIA =
  "https://interoperabilidad.minsal.cl/fhir/ig/r2bo/StructureDefinition/r2bo-extension-tipo-procedimientos-biopsias";

export const EXT_LATERALITY_QUALIFIER =
  "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-laterality-qualifier";

const trim = (v) => String(v ?? "").trim();

/**
 * Convierte un datetime-local ("YYYY-MM-DDTHH:mm") a dateTime FHIR con offset -03:00,
 * si no trae zona horaria.
 */
function toFhirDateTime(dtLocal) {
  const raw = trim(dtLocal);
  if (!raw) return "";

  // si ya trae Z u offset, lo dejamos
  if (/[zZ]$/.test(raw) || /[+\-]\d{2}:\d{2}$/.test(raw)) return raw;

  // si viene sin segundos, agregamos :00
  const withSeconds = raw.length === 16 ? `${raw}:00` : raw;

  // timezone del usuario / proyecto
  return `${withSeconds}-03:00`;
}

/**
 * Permite:
 * - "system|code|display"
 * - "code" (asume SNOMED)
 * - texto libre (usa { text })
 */
function parseCodeableConcept(input, defaultSystem = "http://snomed.info/sct") {
  const raw = trim(input);
  if (!raw) return null;

  if (raw.includes("|")) {
    const [system, code, display] = raw.split("|").map((s) => s.trim());
    if (system && code) {
      return {
        coding: [{ system, code, ...(display ? { display } : {}) }],
        ...(display ? { text: display } : {}),
      };
    }
  }

  // si parece código numérico SNOMED, lo tratamos como coding
  if (/^\d+$/.test(raw)) {
    return { coding: [{ system: defaultSystem, code: raw }] };
  }

  return { text: raw };
}

function extValueCodeableConcept(url, cc) {
  if (!cc) return null;
  return {
    url,
    valueCodeableConcept: cc,
  };
}

/**
 * Builder Specimen (r2bo-muestra-biopsia)
 * Requeridos en tu alcance:
 * - subjectRef (Patient/{id})
 * - receivedTime
 * - collection.collectedDateTime
 * - collection.method + extension
 * - collection.bodySite + extension
 *
 * Además agrego defaults del ejemplo:
 * - status: "available"
 * - type: v2-0487 TISS (Tissue)
 */
export function buildMuestraBiopsia({
  subjectRef,
  receivedTime,
  collectedDateTime,
  method,
  methodExt,
  bodySite,
  bodySiteExt,
}) {
  const specimen = {
    resourceType: "Specimen",
    meta: { profile: [R2BO_MUESTRA_BIOPSIA_PROFILE] },

    status: "available",
    type: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v2-0487",
          code: "TISS",
          display: "Tissue",
        },
      ],
    },

    subject: { reference: trim(subjectRef) },
    receivedTime: toFhirDateTime(receivedTime),

    collection: {
      collectedDateTime: toFhirDateTime(collectedDateTime),

      method: {},
      bodySite: {},
    },
  };

  const methodCC = parseCodeableConcept(method);
  const methodExtCC = parseCodeableConcept(methodExt);
  const bodySiteCC = parseCodeableConcept(bodySite);
  const bodySiteExtCC = parseCodeableConcept(bodySiteExt);

  if (methodCC?.coding?.length) specimen.collection.method.coding = methodCC.coding;
  if (methodCC?.text && !specimen.collection.method.coding) specimen.collection.method.text = methodCC.text;

  const mExt = extValueCodeableConcept(EXT_TIPO_PROCED_BIOPSIA, methodExtCC);
  if (mExt) specimen.collection.method.extension = [mExt];

  if (bodySiteCC?.coding?.length) specimen.collection.bodySite.coding = bodySiteCC.coding;
  if (bodySiteCC?.text && !specimen.collection.bodySite.coding) specimen.collection.bodySite.text = bodySiteCC.text;

  const bExt = extValueCodeableConcept(EXT_LATERALITY_QUALIFIER, bodySiteExtCC);
  if (bExt) specimen.collection.bodySite.extension = [bExt];

  // limpieza mínima (por si vienen vacíos)
  if (!specimen.receivedTime) delete specimen.receivedTime;
  if (!specimen.collection?.collectedDateTime) delete specimen.collection.collectedDateTime;

  // si method quedó vacío
  if (
    specimen.collection?.method &&
    !specimen.collection.method.coding &&
    !specimen.collection.method.text &&
    !specimen.collection.method.extension
  ) {
    delete specimen.collection.method;
  }

  // si bodySite quedó vacío
  if (
    specimen.collection?.bodySite &&
    !specimen.collection.bodySite.coding &&
    !specimen.collection.bodySite.text &&
    !specimen.collection.bodySite.extension
  ) {
    delete specimen.collection.bodySite;
  }

  return specimen;
}