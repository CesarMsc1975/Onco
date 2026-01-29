// src/fhir/buildPatient.js
export function buildPatientResource(form, lookups) {
  const {
    identidadGeneroOptions,
    tipoIdentificadorOptions,
    paisesOptions
  } = lookups;

  const systemIdentidadGenero =
    "https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CSIdentidaddeGenero";
  const systemTipoIdentificador =
    "https://interoperabilidad.minsal.cl/fhir/ig/nid/CodeSystem/CSTipoIdentificador";
  const systemCodPais = "urn:iso:std:iso:3166";

  // name limpio (sin extension: undefined)
const nameObj = {
  use: form.nombreOficialUse,
  family: form.nombreOficialFamily,
  given: form.nombreOficialGiven.trim().split(/\s+/)
};

const tipoIdCodeNid = String(parseInt(form.identifierTypeCode, 10)); // "01" -> "1"

// Segundo apellido como extensión del primitive family (context: HumanName.family)
if (form.nombreOficialSegundoApellido) {
  nameObj._family = {
    extension: [
      {
        url: "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/SegundoApellido",
        valueString: form.nombreOficialSegundoApellido
      }
    ]
  };
}

  return {
    resourceType: "Patient",
    meta: {
      profile: [
        "https://interoperabilidad.minsal.cl/fhir/ig/nid/StructureDefinition/MINSALPaciente"
      ]
    },
    
    extension: [
      {
        url: "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/IdentidadDeGenero",
        valueCodeableConcept: {
          coding: [
            {
              system: systemIdentidadGenero,
              code: form.identidadGenero,
              display:
                identidadGeneroOptions.find((o) => o.code === form.identidadGenero)
                  ?.display || ""
            }
          ]
        }
      },
      {
        url: "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/nacionalidad",
        valueCodeableConcept: {
          coding: [
            {
              system: systemCodPais,
              code: form.nacionalidad,
              display:
                paisesOptions.find((o) => o.code === form.nacionalidad)?.display ||
                ""
            }
          ]
        }
      },
      {
        url: "https://interoperabilidad.minsal.cl/fhir/ig/quirurgico/StructureDefinition/PaisOrigenMPI",
        valueCodeableConcept: {
          coding: [
            {
              system: systemCodPais,
              code: form.paisOrigen,
              display:
                paisesOptions.find((o) => o.code === form.paisOrigen)?.display || ""
            }
          ]
        }
      },
      {
        url: "https://interoperabilidad.minsal.cl/fhir/ig/quirurgico/StructureDefinition/PueblosOriginariosPerteneciente",
        valueBoolean: form.pueblosOriginariosPerteneciente
      }
    ],
    
    identifier: [
  {
    type: {
      coding: [
        {
          system: systemTipoIdentificador,
          code: tipoIdCodeNid
        }
      ],
      extension: [
        {
          url: "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/CodigoPaises",
          valueCodeableConcept: {
            coding: [{ system: systemCodPais, code: form.identifierPaisEmision }]
          }
        }
      ]
    },
    value: form.identifierValue
  }
],

    name: [nameObj],
    gender: form.gender,
    telecom: [
      {
        system: form.telecomSystem,
        value: form.telecomValue
      }
    ],
    birthDate: form.birthDate,
    deceasedBoolean: form.deceasedBoolean
  };
}
