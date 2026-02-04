export default function PatientForm({
  mode,
  // estados/sets del paciente (puedes ir migrando luego a un objeto)
  identifierTypeCode, setIdentifierTypeCode,
  identifierValue, setIdentifierValue,
  identifierPaisEmision, setIdentifierPaisEmision,
  nombreOficialFamily, setNombreOficialFamily,
  nombreOficialSegundoApellido, setNombreOficialSegundoApellido,
  nombreOficialGiven, setNombreOficialGiven,
  gender, setGender,
  identidadGenero, setIdentidadGenero,
  birthDate, setBirthDate,
  deceasedBoolean, setDeceasedBoolean,
  nacionalidad, setNacionalidad,
  paisOrigen, setPaisOrigen,
  pueblosOriginariosPerteneciente, setPueblosOriginariosPerteneciente,
  telecomSystem, setTelecomSystem,
  telecomValue, setTelecomValue,

  // lookups
  tipoIdentificadorOptions,
  identidadGeneroOptions,
  paisesOptions,

  // acciones
  onGenerarJson,
  onValidate,
  onCreate,
  onVolverBusqueda,

  // salidas
  jsonPatient,
  validateOutcome,
  validateResult,
  createResult,
  createResponseRaw,

  // flags
  canValidate,
  isValidating,
  canCreate,
  isCreating
}) {
  return (
    <>
      {/* pega aquí tu form completo */}
    </>
  );
}