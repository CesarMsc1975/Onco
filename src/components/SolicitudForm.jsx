export default function SolicitudForm({
  SolicitudStatus, setSolicitudStatus,
  SolicitudIntent, setSolicitudIntent,

  SolicitudRequester, setSolicitudRequester,
  SolicitudPerformer, setSolicitudPerformer,
  SolicitudReasonCode, setSolicitudReasonCode,
  SolicitudSpecimen, setSolicitudSpecimen,

  MuestraReceivedTime, setMuestraReceivedTime,
  MuestraCollectedDateTime, setMuestraCollectedDateTime,
  MuestraMethod, setMuestraMethod,
  MuestraMethodExt, setMuestraMethodExt,
  MuestraBodySite, setMuestraBodySite,
  MuestraBodySiteExt, setMuestraBodySiteExt,

  subjectRef,
  onLimpiar,
  onBuild,
  jsonSolicitud,

  onBuildMuestra,
  jsonMuestra
}) {

  const REASON_OPTIONS = [
    { code: "363346000", display: "Malignant neoplastic disease" },
    { code: "109356001", display: "Primary malignant neoplasm of unspecified site" },
    { code: "443679004", display: "Malignant neoplasm of skeletal system" },
    { code: "399068003", display: "Malignant tumor of prostate" },
    { code: "1287652008", display: "History of metastatic cancer" },
  ];

    // --- ValueSets pequeños (combobox) para extensiones de Muestra ---
  const TIPO_PROCED_BIOPSIA_OPTIONS = [
    { value: "http://snomed.info/sct|8889005|Excisional biopsy", label: "Excisional biopsy (8889005)" },
    { value: "http://snomed.info/sct|70871006|Incisional biopsy", label: "Incisional biopsy (70871006)" },
  ];

  const LATERALITY_OPTIONS = [
    { value: "http://snomed.info/sct|24028007|Right", label: "Right (24028007)" },
    { value: "http://snomed.info/sct|7771000|Left", label: "Left (7771000)" },
    { value: "http://snomed.info/sct|51440002|Right and left", label: "Right and left (51440002)" },
    { value: "http://snomed.info/sct|399488007|Midline (qualifier value)", label: "Midline (399488007)" },
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#fff",
        color: "#111",
        padding: 18,
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Solicitud (Informe APA)</h3>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Campos: status, intent, code (fijo), requester, performer, reasonCode, specimen
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => onBuild?.()}>
            Generar JSON
          </button>

          <button type="button" onClick={() => onLimpiar?.()}>
            Limpiar
          </button>
        </div>
      </div>

      <fieldset className="card" style={{ marginTop: 14 }}>
        <legend><b>Campos</b></legend>

        <div className="rows" style={{ marginTop: 10 }}>
          <label>subject (Paciente)</label>
          <input value={subjectRef || ""} disabled style={{ background: "#f8fafc" }} />

          <label>status</label>
          <select value={SolicitudStatus} onChange={(e) => setSolicitudStatus(e.target.value)} required>
            <option value="">Seleccione.</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="on-hold">on-hold</option>
            <option value="revoked">revoked</option>
            <option value="completed">completed</option>
            <option value="entered-in-error">entered-in-error</option>
            <option value="unknown">unknown</option>
          </select>

          <label>intent</label>
          <select value={SolicitudIntent} onChange={(e) => setSolicitudIntent(e.target.value)} required>
            <option value="">Seleccione.</option>
            <option value="proposal">proposal</option>
            <option value="plan">plan</option>
            <option value="order">order</option>
            <option value="original-order">original-order</option>
            <option value="reflex-order">reflex-order</option>
            <option value="filler-order">filler-order</option>
            <option value="instance-order">instance-order</option>
            <option value="option">option</option>
          </select>

          {/* code fijo */}
          <label>code (fijo)</label>
          <div style={{ padding: "10px 10px", border: "1px solid #dcdcdc", borderRadius: 10, background: "#f8fafc" }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>system: <b>http://snomed.info/sct</b></div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>code: <b>116784002</b></div>
          </div>

          <label>requester</label>
          <input
            value={SolicitudRequester}
            onChange={(e) => setSolicitudRequester(e.target.value)}
            placeholder="Ej: PractitionerRole/123"
            required
          />

          <label>performer</label>
          <input
            value={SolicitudPerformer}
            onChange={(e) => setSolicitudPerformer(e.target.value)}
            placeholder="Ej: Organization/456"
            required
          />

           <label>Reason (SNOMED)</label>
       
             <select
               value={SolicitudReasonCode}
               onChange={(e) => setSolicitudReasonCode(e.target.value)}
             >
               <option value="">Seleccione...</option>

               {REASON_OPTIONS.map((o) => (
                 <option key={o.code} value={o.code}>
                   {o.code} — {o.display}
                 </option>
               ))}
             </select>

          <label>specimen</label>
          <input
            value={SolicitudSpecimen}
            onChange={(e) => setSolicitudSpecimen(e.target.value)}
            placeholder="Ej: Specimen/789, Specimen/790"
            required
          />
        </div>
      </fieldset>

{/* ===== Sección Muestra (Specimen / r2bo-muestra-biopsia) ===== */}
<div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
  <h3 style={{ margin: "0 0 10px 0" }}>Muestra</h3>

  {/* Subject NO se agrega: usará el mismo Patient/{currentPatient.id} de Solicitud */}

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>receivedTime (Obligatorio)</label>
      <input
        type="datetime-local"
        value={MuestraReceivedTime}
        onChange={(e) => setMuestraReceivedTime(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
      />
    </div>

    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        Colección: collection.collectedDateTime (Obligatorio)
      </label>
      <input
        type="datetime-local"
        value={MuestraCollectedDateTime}
        onChange={(e) => setMuestraCollectedDateTime(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
      />
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        method (Obligatorio) — (por ahora texto/código)
      </label>
      <input
        type="text"
        placeholder="method (ej: código o texto)"
        value={MuestraMethod}
        onChange={(e) => setMuestraMethod(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
      />
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
        Extensión de method (según perfil): la modelamos como texto por ahora.
      </div>
      <label style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
        Extensión de method (Tipo de procedimiento de biopsia)
      </label>
      
      <select
        value={MuestraMethodExt}
        onChange={(e) => setMuestraMethodExt(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
      >
        <option value="">Seleccione...</option>
        {TIPO_PROCED_BIOPSIA_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        bodySite (Obligatorio) — (por ahora texto/código)
      </label>
      <input
        type="text"
        placeholder="bodySite (ej: código o texto)"
        value={MuestraBodySite}
        onChange={(e) => setMuestraBodySite(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
      />
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
        Extensión de bodySite (según perfil): la modelamos como texto por ahora.
      </div>
<label style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
  Extensión de bodySite (Laterality)
</label>

       <select
         value={MuestraBodySiteExt}
         onChange={(e) => setMuestraBodySiteExt(e.target.value)}
         style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
       >
         <option value="">Seleccione...</option>
         {LATERALITY_OPTIONS.map((o) => (
           <option key={o.value} value={o.value}>
             {o.label}
           </option>
         ))}
       </select>
    </div>
  </div>
  
</div>

      {/* Preview JSON */}
      {jsonSolicitud && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>JSON Solicitud</strong>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(JSON.stringify(jsonSolicitud, null, 2))}
            >
              Copiar
            </button>
          </div>

          <pre style={{ marginTop: 10, background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 12, overflow: "auto" }}>
            {JSON.stringify(jsonSolicitud, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <button type="button" onClick={() => onBuildMuestra?.()}>
          Generar JSON Muestra
        </button>
      
        {jsonMuestra && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(JSON.stringify(jsonMuestra, null, 2))}
          >
            Copiar JSON Muestra
          </button>
        )}
      </div>
      
      {jsonMuestra && (
        <div style={{ marginTop: 12 }}>
          <strong>JSON Muestra (Specimen)</strong>
          <pre style={{ marginTop: 10, background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 12, overflow: "auto" }}>
            {JSON.stringify(jsonMuestra, null, 2)}
          </pre>
        </div>
      )}

      <style>{`
        .card { border: 1px solid #e5e5e5; border-radius: 14px; padding: 14px; background: #fafafa; }
        .card legend { padding: 0 8px; }
        .rows { display: grid; grid-template-columns: minmax(170px, 42%) 1fr; gap: 12px; align-items: center; width: 100%; }
        .rows label { font-size: 13px; color: #222; }
        .rows input, .rows select {
          width: 100% !important; min-width: 0;
          padding: 10px 10px; border-radius: 10px; border: 1px solid #dcdcdc; box-sizing: border-box;
        }
        .rows input:focus, .rows select:focus {
          border-color: #94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,0.25); outline: none;
        }
        @media (max-width: 900px) { .rows { grid-template-columns: 140px 1fr; } }
      `}</style>
    </div>
  );
}