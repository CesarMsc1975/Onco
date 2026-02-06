import React, { useState, useEffect } from "react";

import { buildPatientResource } from "./fhir/buildPatient";
import PatientForm from "./components/PatientForm";
import TnmNodoForm from "./components/TnmNodoForm";
import SolicitudForm from "./components/SolicitudForm";
import { buildSolicitudInformeApa } from "./fhir/buildSolicitudInformeApa";

console.log("PatientForm:", PatientForm);
console.log("TnmNodoForm:", TnmNodoForm);


function App() {
  // llamad a proxy local
  const API_BASE = "http://localhost:3002";

  // 🔹 TODOS LOS useState PRIMERO
  const [jsonPatient, setJsonPatient] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [serverPatient, setServerPatient] = useState(null); // Patient completo desde server
  const [activeTab, setActiveTab] = useState("patient"); // "patient" | "tnm"
  // ---- TNM Nodo Regional (Observation) ----
  const [currentPatient, setCurrentPatient] = useState(null); // Patient confirmado por server
  const [tnmBasedOnRef, setTnmBasedOnRef] = useState("");  // ej: "ServiceRequest/123"
  const [tnmStatus, setTnmStatus] = useState("final");     // required 1..1
  const [tnmSubjectRef, setTnmSubjectRef] = useState("");  // ej: "Patient/abc" (ideal auto)
  const [jsonTnmNodo, setJsonTnmNodo] = useState(null);

  // ---- Solicitid de Informe (ServiceRequest) ----
  const [SolicitudStatus, setSolicitudStatus] = useState("");
  const [SolicitudIntent, setSolicitudIntent] = useState("");
  const [SolicitudRequester, setSolicitudRequester] = useState("");
  const [SolicitudPerformer, setSolicitudPerformer] = useState("");
  const [SolicitudReasonCode, setSolicitudReasonCode] = useState("");
  const [SolicitudSpecimen, setSolicitudSpecimen] = useState("");


  const [jsonSolicitud, setJsonSolicitud] = useState(null);

// PractitionerRole search
  const [practitionerIdentifier, setPractitionerIdentifier] = useState("");
  const [practitionerRoleRef, setPractitionerRoleRef] = useState(""); // "PractitionerRole/{id}"
  const [practitionerRoleMsg, setPractitionerRoleMsg] = useState("");
  const [isSearchingPractitionerRole, setIsSearchingPractitionerRole] = useState(false);

  
// Organization search (Prestador Organizacional)
  const [orgIdentifier, setOrgIdentifier] = useState("");
  const [organizationRef, setOrganizationRef] = useState(""); // "Organization/{id}"
  const [organizationMsg, setOrganizationMsg] = useState("");
  const [isSearchingOrganization, setIsSearchingOrganization] = useState(false);

  // 🔹 Después constantes derivadas
  const canCreate = !!jsonPatient && !isCreating;
  const SolicitudSubjectRef = currentPatient?.id ? `Patient/${currentPatient.id}` : "";
  // 🔹 Después funciones
 const [createResult, setCreateResult] = useState(null);
 const [createResponseRaw, setCreateResponseRaw] = useState("");
// isCreating ya lo tienes

useEffect(() => {
  if (currentPatient?.resourceType === "Patient" && currentPatient?.id) {
    setTnmSubjectRef(`Patient/${currentPatient.id}`);
  }
}, [currentPatient]);

useEffect(() => {
  setJsonSolicitud(null);
}, [currentPatient?.id]);

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
      setCurrentPatient(firstPatient);
      loadFormFromPatient(firstPatient);
      setScreen("create");

    } else {
  // ✅ No existe -> modo CREATE desde 0
      setMode("create");
      setCurrentPatient(null);
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

    console.log("POST STATUS:", res.status);
    console.log("POST LOCATION:", res.headers.get("location"));

    if (res.status >= 200 && res.status < 300) {

      const location = res.headers.get("location");
      const idFromLocation =
      location ? location.split("/Patient/")[1]?.split("/")[0] : null;

      let created = null;
      try { created = JSON.parse(text); } catch {}

      if (created?.resourceType === "Patient" && created?.id) {
      setCurrentPatient(created);
      } else if (idFromLocation) {
      const r2 = await fetch(`${API_BASE}/fhir/Patient/${idFromLocation}`, {
      headers: { Accept: "application/fhir+json" }
      });
      const p2 = await r2.json();
       setCurrentPatient(p2);
  }

  } 


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

const handleBuildTnmNodo = () => {
  // Validaciones mínimas (1..1)
  if (!tnmBasedOnRef.trim()) {
    alert("basedOn es requerido (ServiceRequest/...).");
    return;
  }
  if (!tnmStatus) {
    alert("status es requerido.");
    return;
  }
  if (!tnmSubjectRef) {
    alert("subject es requerido (se fija por paciente activo).");
    return;
  }

  const obs = {
    resourceType: "Observation",
    meta: {
      profile: [
        "https://interoperabilidad.minsal.cl/fhir/ig/r2bo/StructureDefinition/r2bo-tnm-categoria-nodo-regional"
      ]
    },
    basedOn: [
      { reference: tnmBasedOnRef.trim() }
    ],
    status: tnmStatus,
    subject: { reference: tnmSubjectRef },
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "371494008",
          display: "Stage of tumour involvement of regional lymph nodes"
        }
      ]
    }
  };

  setJsonTnmNodo(obs);
};

const handleBuildSolicitud = () => {
  if (!SolicitudSubjectRef) return alert("No hay paciente activo (subject). Carga/crea paciente primero.");
  if (!SolicitudStatus) return alert("status es requerido.");
  if (!SolicitudIntent) return alert("intent es requerido.");
  if (!SolicitudRequester.trim()) return alert("requester es requerido (ej: PractitionerRole/123).");
  if (!SolicitudPerformer.trim()) return alert("performer es requerido (ej: Organization/456).");
  if (!SolicitudReasonCode.trim()) return alert("reasonCode es requerido.");
  if (!SolicitudSpecimen.trim()) return alert("specimen es requerido (1 o más, separados por coma).");

  const sr = buildSolicitudInformeApa({
    status: SolicitudStatus,
    intent: SolicitudIntent,
    subjectRef: SolicitudSubjectRef,
    requesterRef: SolicitudRequester,
    performerRef: SolicitudPerformer,
    reasonCode: SolicitudReasonCode,
    specimen: SolicitudSpecimen,
  });

  setJsonSolicitud(sr);
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

const handleBuscarPractitionerRole = async () => {
  const ident = (practitionerIdentifier || "").trim();
  if (!ident) {
    setPractitionerRoleMsg("Debes ingresar un Identificador Prestador.");
    setPractitionerRoleRef("");
    return;
  }

  setIsSearchingPractitionerRole(true);
  setPractitionerRoleMsg("");
  setPractitionerRoleRef("");

  try {
    const url = `/fhir/PractitionerRole?practitioner.identifier=${encodeURIComponent(ident)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/fhir+json" }
    });

    if (!res.ok) {
      const txt = await res.text();
      setPractitionerRoleMsg(`Error HTTP ${res.status}: ${txt}`);
      return;
    }

    const bundle = await res.json();

    const firstEntry = bundle?.entry?.[0];
    const foundId = firstEntry?.resource?.id;

    if (!foundId) {
      setPractitionerRoleMsg("Búsqueda nula");
      setPractitionerRoleRef("");
      return;
    }

    setPractitionerRoleRef(`PractitionerRole/${foundId}`);
    setPractitionerRoleMsg(`Encontrado: ${foundId}`);
  } catch (e) {
    setPractitionerRoleMsg(`Error: ${String(e?.message || e)}`);
  } finally {
    setIsSearchingPractitionerRole(false);
  }
};

const handleBuscarOrganization = async () => {
  const ident = (orgIdentifier || "").trim();

  if (!ident) {
    setOrganizationMsg("Debes ingresar un identificador.");
    setOrganizationRef("");
    return;
  }

  setIsSearchingOrganization(true);
  setOrganizationMsg("");
  setOrganizationRef("");

  try {
    // Usa ruta relativa para que pase por el proxy de CRA (igual que el Rol)
    const url = `/fhir/Organization?identifier=${encodeURIComponent(ident)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/fhir+json" }
    });

    if (!res.ok) {
      const txt = await res.text();
      setOrganizationMsg(`Error HTTP ${res.status}: ${txt}`);
      return;
    }

    const bundle = await res.json();
    const foundId = bundle?.entry?.[0]?.resource?.id;

    if (!foundId) {
      setOrganizationMsg("Búsqueda nula");
      setOrganizationRef("");
      return;
    }

    setOrganizationRef(`Organization/${foundId}`);
    setOrganizationMsg(`Encontrado: ${foundId}`);
  } catch (e) {
    setOrganizationMsg(`Error: ${String(e?.message || e)}`);
  } finally {
    setIsSearchingOrganization(false);
  }
};

console.log("activeTab =", JSON.stringify(activeTab));  
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

      {/* Ingreso Rol (PractitionerRole) */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
        <h3 style={{ margin: "0 0 8px 0" }}>Ingreso Rol</h3>
      
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Identificador Prestador"
            value={practitionerIdentifier}
            onChange={(e) => setPractitionerIdentifier(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", minWidth: 260 }}
          />
      
          <button
            type="button"
            onClick={handleBuscarPractitionerRole}
            disabled={isSearchingPractitionerRole}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              cursor: isSearchingPractitionerRole ? "not-allowed" : "pointer",
              background: "#111827",
              color: "#fff"
            }}
          >
            {isSearchingPractitionerRole ? "Buscando..." : "Buscar"}
          </button>
        </div>
      
        {/* Resultado / cartel */}
        {practitionerRoleMsg && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: practitionerRoleRef ? "#ecfdf5" : "#fef2f2",
              border: "1px solid #e5e7eb"
            }}
          >
            <div style={{ fontWeight: 600 }}>{practitionerRoleMsg}</div>
            {practitionerRoleRef && (
              <div style={{ marginTop: 6, fontFamily: "monospace" }}>
                Ref guardada: {practitionerRoleRef}
              </div>
            )}
          </div>
        )}
      </div>

{/* Prestador Organizacional (Organization) */}
<div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
  <h3 style={{ margin: "0 0 8px 0" }}>Prestador Organizacional</h3>

  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <input
      type="text"
      placeholder="Identificador"
      value={orgIdentifier}
      onChange={(e) => setOrgIdentifier(e.target.value)}
      style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", minWidth: 260 }}
    />

    <button
      type="button"
      onClick={handleBuscarOrganization}
      disabled={isSearchingOrganization}
      style={{
        padding: "8px 12px",
        borderRadius: 12,
        border: "1px solid #ddd",
        cursor: isSearchingOrganization ? "not-allowed" : "pointer",
        background: "#111827",
        color: "#fff"
      }}
    >
      {isSearchingOrganization ? "Buscando..." : "Buscar"}
    </button>
  </div>

  {/* Resultado / cartel */}
  {organizationMsg && (
    <div
      style={{
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: organizationRef ? "#ecfdf5" : "#fef2f2",
        border: "1px solid #e5e7eb"
      }}
    >
      <div style={{ fontWeight: 600 }}>{organizationMsg}</div>

      {organizationRef && (
        <div style={{ marginTop: 6, fontFamily: "monospace" }}>
          Ref guardada: {organizationRef}
        </div>
      )}
    </div>
  )}
</div>

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
  <div style={{ maxWidth: 900, width: "100%", background: "#fff", color: "#111", padding: 16, borderRadius: 12 }}>
    {/* Tabs */}
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setActiveTab("patient")}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid #ddd",
          cursor: "pointer",
          background: activeTab === "patient" ? "#111827" : "#fff",
          color: activeTab === "patient" ? "#fff" : "#111"
        }}
      >
        Paciente
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("tnm")}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid #ddd",
          cursor: "pointer",
          background: activeTab === "tnm" ? "#111827" : "#fff",
          color: activeTab === "tnm" ? "#fff" : "#111"
        }}
      >
        Categoría TNM
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("Solicitud")}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid #ddd",
          cursor: "pointer",
          background: activeTab === "Solicitud" ? "#111827" : "#fff",
          color: activeTab === "Solicitud" ? "#fff" : "#111"
        }}
      >
        Solicitud de Informe
      </button>



    </div>

    {/* Contenido por tab */}
    {activeTab === "patient" && (
      <PatientForm
        mode={mode}
        currentPatient={currentPatient}
        // values + setters (ejemplos)
        identifierValue={identifierValue}
        setIdentifierValue={setIdentifierValue}
        identifierTypeCode={identifierTypeCode}
        setIdentifierTypeCode={setIdentifierTypeCode}
        identifierPaisEmision={identifierPaisEmision}
        setIdentifierPaisEmision={setIdentifierPaisEmision}
        nombreOficialFamily={nombreOficialFamily}
        setNombreOficialFamily={setNombreOficialFamily}
        nombreOficialSegundoApellido={nombreOficialSegundoApellido}
        setNombreOficialSegundoApellido={setNombreOficialSegundoApellido}
        nombreOficialGiven={nombreOficialGiven}
        setNombreOficialGiven={setNombreOficialGiven}
        gender={gender}
        setGender={setGender}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        deceasedBoolean={deceasedBoolean}
        setDeceasedBoolean={setDeceasedBoolean}
        nacionalidad={nacionalidad}
        setNacionalidad={setNacionalidad}
        paisOrigen={paisOrigen}
        setPaisOrigen={setPaisOrigen}
        pueblosOriginariosPerteneciente={pueblosOriginariosPerteneciente}
        setPueblosOriginariosPerteneciente={setPueblosOriginariosPerteneciente}
        identidadGenero={identidadGenero}
        setIdentidadGenero={setIdentidadGenero}
        telecomSystem={telecomSystem}
        setTelecomSystem={setTelecomSystem}
        telecomValue={telecomValue}
        setTelecomValue={setTelecomValue}
        // lookups
        tipoIdentificadorOptions={tipoIdentificadorOptions}
        paisesOptions={paisesOptions}
        identidadGeneroOptions={identidadGeneroOptions}
        // acciones
        onGenerar={handleGenerarPatient}
        onValidate={handleValidatePatient}
        onCreate={handleCreateFicha}
        isCreating={isCreating}
        isValidating={isValidating}
        jsonPatient={jsonPatient}
        validateOutcome={validateOutcome}
        createResult={createResult}
        createResponseRaw={createResponseRaw}
      />
    )}

    {activeTab === "tnm" && (
      <TnmNodoForm
        currentPatient={currentPatient}
        tnmBasedOnRef={tnmBasedOnRef}
        setTnmBasedOnRef={setTnmBasedOnRef}
        tnmStatus={tnmStatus}
        setTnmStatus={setTnmStatus}
        tnmSubjectRef={tnmSubjectRef}
        jsonTnmNodo={jsonTnmNodo}
        onBuild={handleBuildTnmNodo}
      />
    )}

{activeTab === "Solicitud" && (
  <SolicitudForm
    SolicitudStatus={SolicitudStatus} setSolicitudStatus={setSolicitudStatus}
    SolicitudIntent={SolicitudIntent} setSolicitudIntent={setSolicitudIntent}
    SolicitudRequester={SolicitudRequester} setSolicitudRequester={setSolicitudRequester}
    SolicitudPerformer={SolicitudPerformer} setSolicitudPerformer={setSolicitudPerformer}
    SolicitudReasonCode={SolicitudReasonCode} setSolicitudReasonCode={setSolicitudReasonCode}
    SolicitudSpecimen={SolicitudSpecimen} setSolicitudSpecimen={setSolicitudSpecimen}

    subjectRef={SolicitudSubjectRef}              // ✅ (1) subject automático
    onBuild={handleBuildSolicitud}                // ✅ (2) genera JSON
    jsonSolicitud={jsonSolicitud}                 // ✅ (3) se muestra en pantalla

    onLimpiar={() => {
      setSolicitudStatus("");
      setSolicitudIntent("");
      setSolicitudRequester("");
      setSolicitudPerformer("");
      setSolicitudReasonCode("");
      setSolicitudSpecimen("");
      setJsonSolicitud(null); // ✅ limpia el preview también
    }}
  />
)}

  </div>
)}


    </header>
  </div>
);

}

export default App;
