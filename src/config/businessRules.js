/**
 * FC SECHURA — Reglas de negocio centralizadas.
 * Cualquier valor que controle el comportamiento de la academia vive aquí.
 * En el futuro, varios de estos pueden migrar a Firestore (colección `configuracion`)
 * para que tesorería los edite sin redeploy.
 */

// ===== PAGOS =====
export const PRECIO_MENSUALIDAD = 65; // S/ mensualidad base
export const MONEDA = 'S/';
export const DIAS_GRACIA_MENSUALIDAD = 0; // Sin gracia: vence == debe

export const CATALOGO_PRECIOS = Object.freeze({
  'Mensualidad':            65,
  'Mensualidad (BECADO)':   0,
  'Matrícula Anual':        50,
  'Uniforme Completo':      80,
  'Polo de Entrenamiento':  35,
  'Short Deportivo':        25,
  'Inscripción a Torneo':   40,
});

export const METODOS_PAGO = [
  { value: 'Efectivo',           label: 'Efectivo',           emoji: '💵' },
  { value: 'Yape/Plin',          label: 'Yape / Plin',        emoji: '📱' },
  { value: 'Transferencia',      label: 'Transferencia',      emoji: '🏦' },
  { value: 'Aprobación Interna', label: 'Beca / Convenio',    emoji: '✅' },
];

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ===== ROLES =====
export const ROLES = Object.freeze({
  ADMIN:      'admin',
  ENTRENADOR: 'entrenador',
  TESORERO:   'tesorero',
  INVITADO:   'invitado',
});

export const ROLES_STAFF        = [ROLES.ADMIN, ROLES.ENTRENADOR, ROLES.TESORERO];
export const ROLES_DEPORTIVOS   = [ROLES.ADMIN, ROLES.ENTRENADOR];
export const ROLES_FINANCIEROS  = [ROLES.ADMIN, ROLES.TESORERO];
export const ROLES_SOLO_ADMIN   = [ROLES.ADMIN];

// ===== ASISTENCIA =====
export const ANTI_REBOTE_QR_MS = 30_000; // 30s entre escaneos del mismo DNI
export const ESTADOS_ASISTENCIA = Object.freeze({
  ASISTIO: 'Asistió',
  TARDE:   'Tarde',
  FALTO:   'Faltó',
});

// ===== PERFORMANCE / TIERS FIFA =====
export const PLAYER_TIERS = [
  { min: 85, label: 'ÉLITE',  color: '#FBBF24', glow: 'rgba(251, 191, 36, 0.45)' },
  { min: 75, label: 'ORO',    color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.40)' },
  { min: 65, label: 'PLATA',  color: '#94A3B8', glow: 'rgba(148, 163, 184, 0.40)' },
  { min: 0,  label: 'BRONCE', color: '#B45309', glow: 'rgba(180,  83,   9, 0.35)' },
];

export const getPlayerTier = (ovr) =>
  PLAYER_TIERS.find((tier) => ovr >= tier.min) ?? PLAYER_TIERS[PLAYER_TIERS.length - 1];

export const STAT_KEYS = ['ritmo', 'tiro', 'pase', 'regate', 'defensa', 'fisico'];

export const calculateOVR = (stats) =>
  Math.round(STAT_KEYS.reduce((sum, k) => sum + (Number(stats[k]) || 0), 0) / STAT_KEYS.length);

// ===== CATEGORÍAS POR EDAD =====
export const CATEGORIAS = ['4', '5', '6', '7', '8', '9', '10'];

// ===== FORMATEADORES =====
export const formatMoney = (n) => `${MONEDA} ${(Number(n) || 0).toFixed(2)}`;

export const formatDateLima = (date = new Date()) => {
  const opts = { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('es-PE', opts).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return { iso: `${get('year')}-${get('month')}-${get('day')}`, dmy: `${get('day')}/${get('month')}/${get('year')}` };
};
