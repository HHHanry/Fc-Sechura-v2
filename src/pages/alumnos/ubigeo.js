/**
 * Motor de Ubigeo. Conservado tal cual del legacy.
 * Si el negocio crece a más departamentos, mover a Firestore (`configuracion/ubigeo`).
 */
export const ubigeoPeru = {
  'Perú': {
    'Piura': {
      'Sechura': ['Sechura', 'Vice', 'Bernal', 'Bellavista', 'Cristo Nos Valga', 'Rinconada Llicuar'],
      'Piura': ['Piura', 'Castilla', 'Catacaos', 'Cura Mori', 'El Tallán', 'La Arena', 'La Unión', 'Las Lomas', 'Tambo Grande'],
      'Paita': ['Paita', 'Amotape', 'Arenal', 'Colán', 'La Huaca', 'Tamarindo', 'Vichayal'],
      'Talara': ['Pariñas (Talara)', 'El Alto', 'La Brea', 'Lobitos', 'Los Órganos', 'Máncora'],
    },
    'Lambayeque': {
      'Chiclayo': ['Chiclayo', 'José Leonardo Ortiz', 'La Victoria', 'Monsefú', 'Pimentel'],
      'Lambayeque': ['Lambayeque', 'Íllimo', 'Mochumi', 'Mórrope', 'Motupe'],
    },
  },
  'Extranjero': {
    'Otro': {
      'Ciudad Extranjera': ['No aplica'],
    },
  },
};

export const calcularEdad = (fechaNac) => {
  if (!fechaNac) return '';
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad.toString();
};
