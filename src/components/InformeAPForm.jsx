import React from "react";

export default function InformeAPForm({
  subjectRef,
  basedOnRef,
  specimenRef,
  issued,
  setIssued,
  conclusion,
  setConclusion,
  onBuildInforme,
  jsonInforme,

  
}) {
  return (
    <div style={{ padding: 16 }}>

      <h3>Informe Anatomía Patológica</h3>

      <input value={subjectRef ?? ""} disabled />
      <input value={basedOnRef ?? ""} disabled />
      <input value={specimenRef ?? ""} disabled />
      
      <input
        type="datetime-local"
        value={issued ?? ""}
        onChange={(e) => setIssued?.(e.target.value)}
      />
      
      <textarea
        value={conclusion ?? ""}
        onChange={(e) => setConclusion?.(e.target.value)}
      />
      
      <button type="button" onClick={() => onBuildInforme?.()}></button>
      <div style={{ marginBottom: 10 }}>
        <label>Paciente</label>
        <input value={subjectRef || ""} disabled style={{ width: "100%" }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Solicitud (ServiceRequest)</label>
        <input value={basedOnRef || ""} disabled style={{ width: "100%" }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Muestra (Specimen)</label>
        <input value={specimenRef || ""} disabled style={{ width: "100%" }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Fecha emisión informe</label>
        <input
          type="datetime-local"
          value={issued}
          onChange={(e) => setIssued(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Conclusión / Diagnóstico</label>
        <textarea
          rows={6}
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <button onClick={onBuildInforme}>
        Generar JSON Informe AP
      </button>

      {jsonInforme && (
        <div style={{ marginTop: 20 }}>
          <h4>JSON generado</h4>
          <pre style={{
            background: "#111827",
            color: "#e5e7eb",
            padding: 12,
            borderRadius: 8,
            overflow: "auto"
          }}>
            {JSON.stringify(jsonInforme, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );

  
}