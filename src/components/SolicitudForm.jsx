export default function SolicitudForm({
  // estados/sets (los define App.js)
  SolicitudStatus, setSolicitudStatus,
  SolicitudIntent, setSolicitudIntent,

  // aunque lo tengas en estado, el perfil tiene code fijo → lo mostraremos fijo
  SolicitudRequester, setSolicitudRequester,
  SolicitudPerformer, setSolicitudPerformer,
  SolicitudReasonCode, setSolicitudReasonCode,
  SolicitudSpecimen, setSolicitudSpecimen,

  // 👇 nuevo: subject calculado (Patient/{id})
  subjectRef,

  // acciones
  onLimpiar,
  onBuild,

  // salida
  jsonSolicitud
}) {
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

          <label>reasonCode</label>
          <input
            value={SolicitudReasonCode}
            onChange={(e) => setSolicitudReasonCode(e.target.value)}
            placeholder='Ej: "Confirmación diagnóstica" o "system|code|display"'
            required
          />

          <label>specimen</label>
          <input
            value={SolicitudSpecimen}
            onChange={(e) => setSolicitudSpecimen(e.target.value)}
            placeholder="Ej: Specimen/789, Specimen/790"
            required
          />
        </div>
      </fieldset>

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