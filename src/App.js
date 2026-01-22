
import React, { useState } from 'react';


function App() {
  // Campos requeridos según PatientLE
  const [id, setId] = useState("");
  const [identifierValue, setIdentifierValue] = useState("");
  const [identifierTypeCode, setIdentifierTypeCode] = useState("");
  const [identifierTypeSystem] = useState("https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CSTipoIdentificador");

    // ValueSet: Tipo Identificador (VSTipoIdentificador)
    const tipoIdentificadorOptions = [
      { code: "01", display: "RUN" },
      { code: "02", display: "RUN Provisorio" },
      { code: "03", display: "RUN Madre" },
      { code: "04", display: "Número Folio" },
      { code: "05", display: "PPN" },
      { code: "06", display: "Documento de identificación del país de origen" },
      { code: "07", display: "Acta de nacimiento del país de origen" },
      { code: "08", display: "NIP" },
      { code: "09", display: "NIC" },
      { code: "10", display: "IPA" },
      { code: "11", display: "IPE" },
      { code: "12", display: "Número de Ficha Clínica Sistema Local" },
      { code: "13", display: "RNPI" },
      { code: "14", display: "OTRO" }
    ];
  const [identifierPaisEmision, setIdentifierPaisEmision] = useState("");
  const [nombreOficialFamily, setNombreOficialFamily] = useState("");
  const [nombreOficialSegundoApellido, setNombreOficialSegundoApellido] = useState("");
  const [nombreOficialGiven, setNombreOficialGiven] = useState("");
  const [nombreOficialUse, setNombreOficialUse] = useState("official");
  const [telecomSystem, setTelecomSystem] = useState("phone");
  const [telecomValue, setTelecomValue] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deceasedBoolean, setDeceasedBoolean] = useState(false);
  const [nacionalidad, setNacionalidad] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");

    // ValueSet: Códigos de Países (CodPais, ISO 3166-1)
    // Lista representativa, ampliar según necesidad
    const paisesOptions = [
      { code: "032", display: "Argentina" },
      { code: "068", display: "Bolivia" },
      { code: "076", display: "Brasil" },
      { code: "152", display: "Chile" },
      { code: "170", display: "Colombia" },
      { code: "218", display: "Ecuador" },
      { code: "484", display: "México" },
      { code: "604", display: "Perú" },
      { code: "858", display: "Uruguay" },
      { code: "862", display: "Venezuela" },
      { code: "840", display: "Estados Unidos" },
      { code: "724", display: "España" },
      { code: "250", display: "Francia" },
      { code: "380", display: "Italia" },
      { code: "826", display: "Reino Unido" }
    ];
    // Si se agregan más campos code/CodeableConcept, seguir este patrón y asociar el ValueSet correspondiente.
  const [pueblosOriginariosPerteneciente, setPueblosOriginariosPerteneciente] = useState(false);
  const [identidadGenero, setIdentidadGenero] = useState("");
  const [jsonPatient, setJsonPatient] = useState(null);

    // ValueSet: Identidad de Género (VSIdentidaddeGenero)
    const identidadGeneroOptions = [
      { code: "1", display: "Masculino" },
      { code: "2", display: "Femenina" },
      { code: "3", display: "Transgénero Masculino" },
      { code: "4", display: "Transgénero Femenina" },
      { code: "5", display: "No binarie" },
      { code: "6", display: "Otra" },
      { code: "7", display: "No Revelado" }
    ];

  const handleGenerarPatient = () => {
    // ValueSet systems
    const systemIdentidadGenero = "https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CSIdentidaddeGenero";
    const systemTipoIdentificador = "https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CSTipoIdentificador";
    const systemCodPais = "urn:iso:std:iso:3166";

    const patientResource = {
      resourceType: "Patient",
      id: id,
      extension: [
        {
          url: "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/IdentidadDeGenero",
          valueCodeableConcept: {
            coding: [
              {
                system: systemIdentidadGenero,
                code: identidadGenero,
                display: identidadGeneroOptions.find(opt => opt.code === identidadGenero)?.display || ""
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
                code: nacionalidad,
                display: paisesOptions.find(opt => opt.code === nacionalidad)?.display || ""
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
                code: paisOrigen,
                display: paisesOptions.find(opt => opt.code === paisOrigen)?.display || ""
              }
            ]
          }
        },
        {
          url: "https://interoperabilidad.minsal.cl/fhir/ig/quirurgico/StructureDefinition/PueblosOriginariosPerteneciente",
          valueBoolean: pueblosOriginariosPerteneciente
        }
      ],
      identifier: [
        {
          type: {
            coding: [
              {
                system: systemTipoIdentificador,
                code: identifierTypeCode,
                display: tipoIdentificadorOptions.find(opt => opt.code === identifierTypeCode)?.display || ""
              }
            ]
          },
          value: identifierValue,
          extension: [
            {
              url: "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/CodigoPaises",
              valueCodeableConcept: {
                coding: [
                  {
                    system: systemCodPais,
                    code: identifierPaisEmision,
                    display: paisesOptions.find(opt => opt.code === identifierPaisEmision)?.display || ""
                  }
                ]
              }
            }
          ]
        }
      ],
      name: [
        {
          use: nombreOficialUse,
          family: nombreOficialFamily,
          given: [nombreOficialGiven],
          extension: nombreOficialSegundoApellido ? [
            {
              url: "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/SegundoApellido",
              valueString: nombreOficialSegundoApellido
            }
          ] : undefined
        }
      ],
      telecom: [
        {
          system: telecomSystem,
          value: telecomValue
        }
      ],
      birthDate: birthDate,
      deceasedBoolean: deceasedBoolean
    };
    setJsonPatient(patientResource);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <h2>Formulario PatientLE (campos requeridos)</h2>
        <form style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }} onSubmit={e => { e.preventDefault(); handleGenerarPatient(); }}>
          <label>Identidad de Género:
            <select value={identidadGenero} onChange={e => setIdentidadGenero(e.target.value)} required>
              <option value="">Seleccione...</option>
              {identidadGeneroOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>
          </label><br />
          <label>ID: <input type="text" value={id} onChange={e => setId(e.target.value)} required /></label><br />
          <label>Identificador (value): <input type="text" value={identifierValue} onChange={e => setIdentifierValue(e.target.value)} required /></label><br />
          <label>Tipo de Identificador:
            <select value={identifierTypeCode} onChange={e => setIdentifierTypeCode(e.target.value)} required>
              <option value="">Seleccione...</option>
              {tipoIdentificadorOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>
          </label><br />
          <label>País Emisión Identificador: <input type="text" value={identifierPaisEmision} onChange={e => setIdentifierPaisEmision(e.target.value)} required /></label><br />
          <label>Primer Apellido: <input type="text" value={nombreOficialFamily} onChange={e => setNombreOficialFamily(e.target.value)} required /></label><br />
          <label>Segundo Apellido: <input type="text" value={nombreOficialSegundoApellido} onChange={e => setNombreOficialSegundoApellido(e.target.value)} /></label><br />
          <label>Nombres: <input type="text" value={nombreOficialGiven} onChange={e => setNombreOficialGiven(e.target.value)} required /></label><br />
          <label>Teléfono/Email: <input type="text" value={telecomValue} onChange={e => setTelecomValue(e.target.value)} required /></label><br />
          <label>Sistema de Contacto:
            <select value={telecomSystem} onChange={e => setTelecomSystem(e.target.value)}>
              <option value="phone">Teléfono</option>
              <option value="email">Email</option>
            </select>
          </label><br />
          <label>Fecha de Nacimiento: <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required /></label><br />
          <label>¿Fallecido?: <input type="checkbox" checked={deceasedBoolean} onChange={e => setDeceasedBoolean(e.target.checked)} /></label><br />
          <label>Nacionalidad:
            <select value={nacionalidad} onChange={e => setNacionalidad(e.target.value)} required>
              <option value="">Seleccione...</option>
              {paisesOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>
          </label><br />
          <label>País de Origen:
            <select value={paisOrigen} onChange={e => setPaisOrigen(e.target.value)} required>
              <option value="">Seleccione...</option>
              {paisesOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>
          </label><br />
          <label>Pueblos Originarios Perteneciente: <input type="checkbox" checked={pueblosOriginariosPerteneciente} onChange={e => setPueblosOriginariosPerteneciente(e.target.checked)} /></label><br />
          <button type="submit" style={{ marginTop: 10 }}>Generar JSON PatientLE</button>
        </form>
        {jsonPatient && (
          <pre style={{ marginTop: 20, color: 'yellow', textAlign: 'left', background: '#222', padding: 10, borderRadius: 6 }}>
            {JSON.stringify(jsonPatient, null, 2)}
          </pre>
        )}
      </header>
    </div>
  );
}

export default App;
