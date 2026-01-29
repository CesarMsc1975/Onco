import React, { useState } from "react";
import { buildPatientResource } from "./fhir/buildPatient";

function App() {
  // Estados formulario
  const [id, setId] = useState("");
  const [identifierValue, setIdentifierValue] = useState("");
  const [identifierTypeCode, setIdentifierTypeCode] = useState("");
  const [identifierPaisEmision, setIdentifierPaisEmision] = useState("");

  const [nombreOficialFamily, setNombreOficialFamily] = useState("");
  const [nombreOficialSegundoApellido, setNombreOficialSegundoApellido] = useState("");
  const [nombreOficialGiven, setNombreOficialGiven] = useState("");
  const [nombreOficialUse, setNombreOficialUse] = useState("official");

  const [gender, setGender] = useState("");

  const [telecomSystem, setTelecomSystem] = useState("phone");
  const [telecomValue, setTelecomValue] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [deceasedBoolean, setDeceasedBoolean] = useState(false);

  const [nacionalidad, setNacionalidad] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");
  const [pueblosOriginariosPerteneciente, setPueblosOriginariosPerteneciente] = useState(false);
  const [identidadGenero, setIdentidadGenero] = useState("");

  // Salidas
  const [jsonPatient, setJsonPatient] = useState(null);

  // Validación
  const [canValidate, setCanValidate] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validateResult, setValidateResult] = useState(null); // { ok, summary }
  const [validateOutcome, setValidateOutcome] = useState(null); // OperationOutcome

  // ValueSets (tus listas)
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

  const identidadGeneroOptions = [
    { code: "1", display: "Masculino" },
    { code: "2", display: "Femenina" },
    { code: "3", display: "Transgénero Masculino" },
    { code: "4", display: "Transgénero Femenina" },
    { code: "5", display: "No binarie" },
    { code: "6", display: "Otra" },
    { code: "7", display: "No Revelado" }
  ];

  // 1) Generar JSON
  const handleGenerarPatient = () => {
    const form = {
      
      identifierValue,
      identifierTypeCode,
      identifierPaisEmision,
      nombreOficialFamily,
      nombreOficialSegundoApellido,
      nombreOficialGiven,
      nombreOficialUse,
      gender,
      telecomSystem,
      telecomValue,
      birthDate,
      deceasedBoolean,
      nacionalidad,
      paisOrigen,
      pueblosOriginariosPerteneciente,
      identidadGenero
    };

    const lookups = {
      identidadGeneroOptions,
      tipoIdentificadorOptions,
      paisesOptions
    };

    const patientResource = buildPatientResource(form, lookups);
    setJsonPatient(patientResource);

    // habilita validación
    setCanValidate(true);
    setValidateResult(null);
    setValidateOutcome(null);
  };

  // 2) Validar en server (POST Patient/$validate)
  const handleValidatePatient = async () => {
    if (!jsonPatient) return;

    setIsValidating(true);
    setValidateResult(null);
    setValidateOutcome(null);

    try {
      const res = await fetch("https://fhirserver.hl7chile.cl/Patient/$validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          "Accept": "application/fhir+json"
        },
        body: JSON.stringify(jsonPatient)
      });

      const data = await res.json();
      const issues = Array.isArray(data?.issue) ? data.issue : [];
      const hasErrors = issues.some(i => ["fatal", "error"].includes(i?.severity));
      const warningCount = issues.filter(i => i?.severity === "warning").length;

      const ok = res.ok && !hasErrors;
      const summary = ok
        ? `✅ Válido. Warnings: ${warningCount}`
        : `❌ No válido. Errores/fatal encontrados.`;

      setValidateOutcome(data);
      setValidateResult({ ok, summary });
    } catch (e) {
      setValidateResult({
        ok: false,
        summary: "❌ No se pudo validar (red/CORS o servidor no responde)."
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleLimpiar = () => {
    setId("");
    setIdentifierValue("");
    setIdentifierTypeCode("");
    setIdentifierPaisEmision("");

    setNombreOficialFamily("");
    setNombreOficialSegundoApellido("");
    setNombreOficialGiven("");
    setNombreOficialUse("official");

    setTelecomSystem("phone");
    setTelecomValue("");

    setBirthDate("");
    setDeceasedBoolean(false);

    setNacionalidad("");
    setPaisOrigen("");
    setPueblosOriginariosPerteneciente(false);
    setIdentidadGenero("");

    setJsonPatient(null);

    setCanValidate(false);
    setValidateResult(null);
    setValidateOutcome(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Formulario PatientLE (campos requeridos)</h2>

        {/* FORMULARIO (aquí puedes pegar tu versión en 2 columnas) */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleGenerarPatient(); }}
          style={{ textAlign: "left", maxWidth: 900, margin: "0 auto", background: "#fff", color: "#111", padding: 16, borderRadius: 12 }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button type="submit">Generar JSON</button>
            <button type="button" onClick={handleLimpiar}>Limpiar</button>

            <button
              type="button"
              onClick={handleValidatePatient}
              disabled={!canValidate || isValidating}
              style={{
                opacity: (!canValidate || isValidating) ? 0.6 : 1,
                border: "3px solid red",
                background: "yellow",
                color: "black",
                padding: "10px 14px",
                borderRadius: 10
              }}
            >
              {isValidating ? "Validando..." : "Validar ($validate)"}
            </button>
          </div>

          {/* Campos mínimos (puedes reemplazar por tu UI 2 columnas) */}
          <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16
  }}
>
  <div className="grid2">
  {/* IDENTIFICACIÓN */}
  <fieldset className="card">
    <legend><strong>Identificación</strong></legend>

    <div className="rows">
      <label>ID (FHIR)</label>
      <input value={id} onChange={e => setId(e.target.value)} required />

      <label>Tipo identificador</label>
      <select value={identifierTypeCode} onChange={e => setIdentifierTypeCode(e.target.value)} required>
        <option value="">Seleccione...</option>
        {tipoIdentificadorOptions.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.display}</option>
        ))}
      </select>

      <label>Sexo (gender)</label>
      <select value={gender} onChange={e => setGender(e.target.value)} required>
        <option value="">Seleccione...</option>
        <option value="male">Masculino</option>
        <option value="female">Femenino</option>
        <option value="other">Otro</option>
        <option value="unknown">Desconocido</option>
      </select>

      <label>Identificador</label>
      <input value={identifierValue} onChange={e => setIdentifierValue(e.target.value)} required />

      <label>País emisión</label>
      <select value={identifierPaisEmision} onChange={e => setIdentifierPaisEmision(e.target.value)} required>
        <option value="">Seleccione...</option>
        {paisesOptions.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.display}</option>
        ))}
      </select>
    </div>
  </fieldset>

     
  {/* NOMBRE */}
  <fieldset className="card">
    <legend><strong>Nombre</strong></legend>

    <div className="rows">
      <label>Primer apellido</label>
      <input value={nombreOficialFamily} onChange={e => setNombreOficialFamily(e.target.value)} required />

      <label>Segundo apellido</label>
      <input value={nombreOficialSegundoApellido} onChange={e => setNombreOficialSegundoApellido(e.target.value)} />

      <label>Nombres</label>
      <input value={nombreOficialGiven} onChange={e => setNombreOficialGiven(e.target.value)} required />

      {/* si quieres, puedes agregar use=official oculto o selector */}
    </div>
  </fieldset>

  {/* DEMOGRAFÍA */}
  <fieldset className="card">
    <legend><strong>Demografía</strong></legend>

    <div className="rows">
      <label>Identidad de género</label>
      <select value={identidadGenero} onChange={e => setIdentidadGenero(e.target.value)} required>
        <option value="">Seleccione...</option>
        {identidadGeneroOptions.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.display}</option>
        ))}
      </select>

      <label>Nacionalidad</label>
      <select value={nacionalidad} onChange={e => setNacionalidad(e.target.value)} required>
        <option value="">Seleccione...</option>
        {paisesOptions.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.display}</option>
        ))}
      </select>

      <label>País de origen</label>
      <select value={paisOrigen} onChange={e => setPaisOrigen(e.target.value)} required>
        <option value="">Seleccione...</option>
        {paisesOptions.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.display}</option>
        ))}
      </select>

      <label>Fecha nacimiento</label>
      <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />

      <label>¿Fallecido?</label>
      <input type="checkbox" checked={deceasedBoolean} onChange={e => setDeceasedBoolean(e.target.checked)} />

      <label>Pueblos originarios</label>
      <input type="checkbox" checked={pueblosOriginariosPerteneciente} onChange={e => setPueblosOriginariosPerteneciente(e.target.checked)} />
    </div>
  </fieldset>

  {/* CONTACTO */}
  <fieldset className="card">
    <legend><strong>Contacto</strong></legend>

    <div className="rows">
      <label>Sistema</label>
      <select value={telecomSystem} onChange={e => setTelecomSystem(e.target.value)}>
        <option value="phone">Teléfono</option>
        <option value="email">Email</option>
      </select>

      <label>Valor</label>
      <input value={telecomValue} onChange={e => setTelecomValue(e.target.value)} required />
    </div>
  </fieldset>
</div>
</div>


          {/* JSON generado */}
          {jsonPatient && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>JSON generado</strong>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(JSON.stringify(jsonPatient, null, 2))}
                >
                  Copiar
                </button>
              </div>

              <pre style={{ marginTop: 10, background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 12, overflow: "auto" }}>
                {JSON.stringify(jsonPatient, null, 2)}
              </pre>
            </div>
          )}

          {/* Resultado validación */}
          {validateResult && (
            <div style={{ marginTop: 12 }}>
              <strong>{validateResult.summary}</strong>
            </div>
          )}

          {validateOutcome && (
            <pre style={{ marginTop: 10, background: "#111", color: "#e2e8f0", padding: 12, borderRadius: 12, overflow: "auto" }}>
              {JSON.stringify(validateOutcome, null, 2)}
            </pre>
          )}

          <style>{`
           .grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  width: 100%;
  max-width: 900px;
  margin: 16px auto 0;
}

.card {
  width: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 14px;
  background: #fafafa;
}

.card legend {
  padding: 0 8px;
}

.rows {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.rows > * {
  min-width: 0;
}

.rows input,
.rows select {
  width: 100% !important;
  min-width: 220px;
  padding: 9px 10px;
  border: 1px solid #dcdcdc;
  border-radius: 10px;
  box-sizing: border-box;
}


.rows input[type="checkbox"] {
  width: auto;
  padding: 0;
}

button {
  font-size: 14px;
  padding: 10px 12px;
}

@media (max-width: 900px) {
  .grid2 { grid-template-columns: 1fr; }
  .rows { grid-template-columns: 140px 1fr; }
}

`}</style>

        </form>
      </header>
    </div>
  );
}

export default App;
