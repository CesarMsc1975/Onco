import React, { useState } from "react";
import { buildPatientResource } from "./fhir/buildPatient";

function App() {
  // llamad a proxy local
  const API_BASE = "http://localhost:3002";

  // 🔹 TODOS LOS useState PRIMERO
  const [jsonPatient, setJsonPatient] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [serverPatient, setServerPatient] = useState(null); // Patient completo desde server

  
 
  // 🔹 Después constantes derivadas
  const canCreate = !!jsonPatient && !isCreating;

  // 🔹 Después funciones
 const [createResult, setCreateResult] = useState(null);
 const [createResponseRaw, setCreateResponseRaw] = useState("");
// isCreating ya lo tienes

const handleCreateFicha = async () => {
  // ✅ Si aún no existe jsonPatient, lo generamos automáticamente (TU IDEA)
  const patientToCreate = jsonPatient ?? buildPatientResource(
    {
      identifierTypeCode,
      identifierValue,
      identifierPaisEmision,
      nombreOficialFamily,
      nombreOficialSegundoApellido,
      nombreOficialGiven,
      gender,
      identidadGenero,
      birthDate,
      deceasedBoolean,
      nacionalidad,
      paisOrigen,
      pueblosOriginariosPerteneciente,
      telecomSystem,
      telecomValue
    },
    {
      identidadGeneroOptions,
      tipoIdentificadorOptions,
      paisesOptions
    }
  );

  // opcional: para que quede visible en pantalla
  setJsonPatient(patientToCreate);

  setIsCreating(true);
  setCreateResult(null);
  setCreateResponseRaw("");

  try {
    const res = await fetch(`${API_BASE}/fhir/Patient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json"
      },
      body: JSON.stringify(patientToCreate)
    });

    const text = await res.text();
    setCreateResponseRaw(text);

    console.log("POST /Patient STATUS:", res.status);
    console.log("POST /Patient HEADERS:", Object.fromEntries(res.headers.entries()));
    console.log("POST /Patient RAW:", text);
    

    let data = null;
    try { data = JSON.parse(text); } catch { /* puede venir vacío */ }

    const location = res.headers.get("location") || res.headers.get("Location");
    const idFromBody = data?.id || null;
    const idFromLocation = location ? (location.split("/Patient/")[1]?.split("/")[0] || null) : null;
    const newId = idFromBody || idFromLocation;

    

    // ✅ OK
    // ✅ OK: mostramos respuesta y NO volvemos a búsqueda
    setCreateResult({
      ok: true,
      summary: `✅ Ficha creada (HTTP ${res.status}).`,
      id: newId,
      location
    });

// 👇 NO limpiar, NO setScreen("search") todavía
// handleLimpiar();
// setScreen("search");
    setScreen("create"); // te quedas aquí para ver la respuesta


    // 🔁 Volver a búsqueda solo si fue OK
    //handleLimpiar();
    //setScreen("search");

  } catch (e) {
    setCreateResult({ ok: false, summary: "❌ No se pudo crear ficha (proxy/red)." });
  } finally {
    setIsCreating(false);
  }
};



  const [screen, setScreen] = useState("search"); // "search" | "view" | "create"
  const [searchFamily, setSearchFamily] = useState("");
  const [searchIdentifier, setSearchIdentifier] = useState("");
  const [foundPatient, setFoundPatient] = useState(null); // Patient resource
  const [foundBundle, setFoundBundle] = useState(null);   // Bundle full response (opcional)
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const handleSearchPatient = async () => {

  setIsSearching(true);
  setSearchError(null);
 


  try {
    const params = new URLSearchParams();

    if (searchIdentifier.trim()) {
      params.set("identifier", searchIdentifier.trim());
    } else if (searchFamily.trim()) {
      params.set("family", searchFamily.trim());
    } else {
      setSearchError("Ingresa apellido o RUN/identificador.");
      return;
    }

    const res = await fetch(`${API_BASE}/fhir/Patient?${params.toString()}`, {
      method: "GET",
      headers: { "Accept": "application/fhir+json" }
    });

    const data = await res.json();
    setFoundBundle(data);

    const entries = Array.isArray(data?.entry) ? data.entry : [];
    const firstPatient =
      entries.find(e => e?.resource?.resourceType === "Patient")?.resource || null;

    if (firstPatient) {
  // ✅ Existe -> modo EDIT
      setMode("edit");
      setServerPatient(firstPatient);
      loadFormFromPatient(firstPatient);
      setScreen("create");

    } else {
  // ✅ No existe -> modo CREATE desde 0
      setMode("create");
      setServerPatient(null);
      handleLimpiar();
      setScreen("create");


  // opcional: prellenar con lo que buscó
      if (searchFamily.trim()) setNombreOficialFamily(searchFamily.trim());
      if (searchIdentifier.trim()) setIdentifierValue(searchIdentifier.trim());

      setScreen("create");
    }


  } catch (e) {
    setSearchError("No se pudo consultar el servidor (CORS/red/proxy).");
  } finally {
    setIsSearching(false);
  }
};   // 👈 ESTA LLAVE CIERRA LA FUNCIÓN


  //Pantallas separadas
  
 
  
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
    const res = await fetch("http://localhost:3002/validate/patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(jsonPatient)
    });

    console.log("STATUS:", res.status);
    console.log("HEADERS:", Object.fromEntries(res.headers.entries()));

    const text = await res.text();   // 👈 AQUÍ
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
      console.log("JSON PARSEADO:", data);
      setCreateResponseRaw(text);
    } catch {
      console.log("No es JSON válido");
      data = { raw: text };
    }

    setValidateOutcome(data);

  } catch (e) {
    console.error("ERROR EN FETCH:", e);
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
    setGender("");
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

const loadFormFromPatient = (p) => {
  // ---------- helpers ----------
  const getExt = (arr, url) => (Array.isArray(arr) ? arr.find(e => e?.url === url) : null);

  const getCCCode = (ext) =>
    ext?.valueCodeableConcept?.coding?.[0]?.code || "";

  // URLs exactas según tu ejemplo
  const URL_IDENTIDAD_GENERO = "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/IdentidadDeGenero";
  const URL_NACIONALIDAD     = "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/nacionalidad";
  const URL_PAIS_ORIGEN      = "https://interoperabilidad.minsal.cl/fhir/ig/quirurgico/StructureDefinition/PaisOrigenMPI";
  const URL_PPO_PERTENECE    = "https://interoperabilidad.minsal.cl/fhir/ig/quirurgico/StructureDefinition/PueblosOriginariosPerteneciente";

  const URL_SEGUNDO_APELLIDO = "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/SegundoApellido";
  const URL_CODIGO_PAISES    = "https://hl7chile.cl/fhir/ig/clcore/StructureDefinition/CodigoPaises";

  // ---------- extensiones raíz Patient.extension ----------
  const rootExt = Array.isArray(p?.extension) ? p.extension : [];

  const extIdentidad = getExt(rootExt, URL_IDENTIDAD_GENERO);
  setIdentidadGenero(getCCCode(extIdentidad)); // ej: "1"

  const extNac = getExt(rootExt, URL_NACIONALIDAD);
  setNacionalidad(getCCCode(extNac)); // ej: "152"

  const extPaisOrigen = getExt(rootExt, URL_PAIS_ORIGEN);
  setPaisOrigen(getCCCode(extPaisOrigen)); // ej: "152"

  const extPpo = getExt(rootExt, URL_PPO_PERTENECE);
  setPueblosOriginariosPerteneciente(!!extPpo?.valueBoolean); // false si no está o si viene false

  // ---------- identifier ----------
  const ident = Array.isArray(p?.identifier) ? p.identifier[0] : null;

  setIdentifierValue(ident?.value || "");

  // type.coding[0].code
  const typeCode = ident?.type?.coding?.[0]?.code || "";
  setIdentifierTypeCode(typeCode);

  // País emisión dentro de identifier.type.extension[CodigoPaises]
  const typeExt = Array.isArray(ident?.type?.extension) ? ident.type.extension : [];
  const extCodPais = getExt(typeExt, URL_CODIGO_PAISES);
  const paisEmision = getCCCode(extCodPais); // ej: "152"
  setIdentifierPaisEmision(paisEmision);

  // ---------- name ----------
  const name = Array.isArray(p?.name) ? p.name.find(n => n?.use === "official") || p.name[0] : null;

  setNombreOficialFamily(name?.family || "");

  // Segundo apellido está en name._family.extension[SegundoApellido]
  const famExtArr = Array.isArray(name?._family?.extension) ? name._family.extension : [];
  const extSegundo = getExt(famExtArr, URL_SEGUNDO_APELLIDO);
  setNombreOficialSegundoApellido(extSegundo?.valueString || "");

  // given array
  const givenArr = Array.isArray(name?.given) ? name.given : [];
  setNombreOficialGiven(givenArr.join(" ").trim());

  // ---------- básicos ----------
  setGender(p?.gender || "");
  setBirthDate(p?.birthDate || "");

  if (typeof p?.deceasedBoolean === "boolean") setDeceasedBoolean(p.deceasedBoolean);
  else setDeceasedBoolean(false);

  // telecom (si existe)
  const telecom = Array.isArray(p?.telecom) ? p.telecom[0] : null;
  setTelecomSystem(telecom?.system || "phone");
  setTelecomValue(telecom?.value || "");

  // para que el preview muestre lo traído del server (opcional)
  setJsonPatient(p);
};

  
return (
  <div className="App">
    <header className="App-header">

      {/* =========================
          PANTALLA BUSQUEDA
      ========================== */}
      {screen === "search" && (
        <div style={{ maxWidth: 700, width: "100%", background: "#fff", color: "#111", padding: 16, borderRadius: 12 }}>
          <h3>Búsqueda de paciente</h3>

          <div className="rows">
            <label>Apellido</label>
            <input
              value={searchFamily}
              onChange={(e) => setSearchFamily(e.target.value)}
            />

            <label>RUN / Identificador</label>
            <input
              value={searchIdentifier}
              onChange={(e) => setSearchIdentifier(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button type="button" onClick={handleSearchPatient}>
              Buscar en servidor
            </button>

            <button
              type="button"
              onClick={() => setScreen("create")}
            >
              Crear nuevo
            </button>
          </div>
        </div>
      )}

      {/* =========================
          PANTALLA VER JSON
      ========================== */}
      {screen === "view" && foundPatient && (
        <div style={{ maxWidth: 900, width: "100%", background: "#fff", color: "#111", padding: 16, borderRadius: 12 }}>
          <h3>Paciente encontrado</h3>

          <pre style={{ marginTop: 12, background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 12, overflow: "auto" }}>
            {JSON.stringify(foundPatient, null, 2)}
          </pre>

          <button onClick={() => setScreen("search")}>
            Volver
          </button>
        </div>
      )}

      {/* =========================
          PANTALLA CREAR PACIENTE
      ========================== */}
     {screen === "create" && (
  <>
    <h2>Formulario PatientLE (campos requeridos)</h2>

    <form
      onSubmit={(e) => { e.preventDefault(); handleGenerarPatient(); }}
      style={{
        textAlign: "left",
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
          <h3 style={{ margin: 0 }}>
             {mode === "edit" ? "Paciente encontrado (editar)" : "Nuevo paciente"}
          </h3>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Campos requeridos + extensiones
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}>
            Generar JSON
          </button>

          <button
            type="button"
            onClick={handleValidatePatient}
            disabled={!canValidate || isValidating}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer", opacity: (!canValidate || isValidating) ? 0.6 : 1 }}
          >
            {isValidating ? "Validando..." : "Validar en servidor ($validate)"}
          </button>

          <button
            type="button"
            onClick={handleLimpiar}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={() => setScreen("search")}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
          >
            Volver a búsqueda
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL (2 columnas) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>

        {/* Identificación */}
        <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
          <legend style={{ padding: "0 8px" }}><strong>Identificación</strong></legend>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
            {/* NO lo borramos, lo dejamos comentado */}
            {/*
            <label>ID (FHIR):</label>
            <input value={id} onChange={e => setId(e.target.value)} placeholder="No necesario (server asigna)" />
            */}

            <label>Tipo identificador:</label>
            <select value={identifierTypeCode} onChange={e => setIdentifierTypeCode(e.target.value)} required>
              <option value="">Seleccione...</option>
              {tipoIdentificadorOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>

            <label>Identificador (value):</label>
            <input value={identifierValue} onChange={e => setIdentifierValue(e.target.value)} required placeholder="Ej: 12.345.678-9" />

            <label>País emisión ID:</label>
            <select value={identifierPaisEmision} onChange={e => setIdentifierPaisEmision(e.target.value)} required>
              <option value="">Seleccione...</option>
              {paisesOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Nombre */}
        <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
          <legend style={{ padding: "0 8px" }}><strong>Nombre</strong></legend>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
            <label>Primer apellido:</label>
            <input value={nombreOficialFamily} onChange={e => setNombreOficialFamily(e.target.value)} required />

            <label>Segundo apellido:</label>
            <input value={nombreOficialSegundoApellido} onChange={e => setNombreOficialSegundoApellido(e.target.value)} />

            <label>Nombres:</label>
            <input value={nombreOficialGiven} onChange={e => setNombreOficialGiven(e.target.value)} required />
          </div>
        </fieldset>

        {/* Demografía */}
        <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
          <legend style={{ padding: "0 8px" }}><strong>Demografía y origen</strong></legend>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
            <label>Sexo (gender):</label>
            <select value={gender} onChange={e => setGender(e.target.value)} required>
              <option value="">Seleccione...</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="unknown">Desconocido</option>
            </select>

            <label>Identidad de género:</label>
            <select value={identidadGenero} onChange={e => setIdentidadGenero(e.target.value)} required>
              <option value="">Seleccione...</option>
              {identidadGeneroOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>

            <label>Fecha nacimiento:</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />

            <label>¿Fallecido?:</label>
            <input type="checkbox" checked={deceasedBoolean} onChange={e => setDeceasedBoolean(e.target.checked)} />

            <label>Nacionalidad:</label>
            <select value={nacionalidad} onChange={e => setNacionalidad(e.target.value)} required>
              <option value="">Seleccione...</option>
              {paisesOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>

            <label>País de origen:</label>
            <select value={paisOrigen} onChange={e => setPaisOrigen(e.target.value)} required>
              <option value="">Seleccione...</option>
              {paisesOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.display}</option>
              ))}
            </select>

            <label>Pueblos originarios:</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={pueblosOriginariosPerteneciente}
                onChange={e => setPueblosOriginariosPerteneciente(e.target.checked)}
              />
              Pertenece
            </label>
          </div>
        </fieldset>

        {/* Contacto */}
        <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
          <legend style={{ padding: "0 8px" }}><strong>Contacto</strong></legend>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
            <label>Canal:</label>
            <select value={telecomSystem} onChange={e => setTelecomSystem(e.target.value)}>
              <option value="phone">Teléfono</option>
              <option value="email">Email</option>
            </select>

            <label>Valor:</label>
            <input
              value={telecomValue}
              onChange={e => setTelecomValue(e.target.value)}
              required
              placeholder={telecomSystem === "email" ? "nombre@dominio.cl" : "+56 9 1234 5678"}
            />
          </div>
        </fieldset>
      </div>

      {/* JSON preview */}
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

    {/* 👇 BOTÓN CREAR FICHA VA AQUÍ */}
    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
      {mode === "create" && (
        <button type="button" onClick={handleCreateFicha} disabled={isCreating || !jsonPatient}>
          {isCreating ? "Creando..." : "Crear ficha"}
        </button>
      )}

      
      {createResult && (
  <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#f3f4f6", color: "#111" }}>
    <strong style={{ color: createResult.ok ? "green" : "crimson" }}>
      {createResult.summary}
    </strong>

    {createResult.location && (
      <div style={{ marginTop: 6, fontSize: 12 }}>
        <div><b>Location:</b> {createResult.location}</div>
        {createResult.id && <div><b>ID:</b> {createResult.id}</div>}
      </div>
    )}

    {/* Botón para volver solo cuando tú quieras */}
    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
      <button type="button" onClick={() => { handleLimpiar(); setScreen("search"); }}>
        Volver a búsqueda
      </button>
    </div>
  </div>
)}

{createResponseRaw && (
  <pre style={{ marginTop: 10, background: "#111", color: "#e2e8f0", padding: 12, borderRadius: 12, overflow: "auto" }}>
    {createResponseRaw}
  </pre>
)}

  
  


    </div>
  </div>
    )}


      {/* Resultado validación */}
      {validateResult && (
        <div style={{ marginTop: 15 }}>
          <strong>{validateResult.summary}</strong>
        </div>
      )}

      {validateOutcome && (
        <pre style={{ marginTop: 10, background: "#111", color: "#e2e8f0", padding: 12, borderRadius: 12, overflow: "auto" }}>
          {JSON.stringify(validateOutcome, null, 2)}
        </pre>
      )}

      

   
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button
        type="button"
        onClick={handleCreateFicha}
        disabled={isCreating || !jsonPatient}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: "pointer",
          opacity: (isCreating || !jsonPatient) ? 0.6 : 1
        }}
      >
        {isCreating ? "Creando..." : "Crear ficha"}
      </button>
    </div>


      {/* “CSS” mínimo para inputs (NO BORRAR) */}
      <style>{`
        input, select {
          width: 100%;
          padding: 10px 10px;
          border-radius: 10px;
          border: 1px solid #dcdcdc;
          outline: none;
          box-sizing: border-box;
          min-width: 0;
        }
        input:focus, select:focus {
          border-color: #94a3b8;
          box-shadow: 0 0 0 3px rgba(148,163,184,0.25);
        }
        fieldset { background: #fafafa; }
      `}</style>
    </form>
  </>
)}


    </header>
  </div>
);

}

export default App;
