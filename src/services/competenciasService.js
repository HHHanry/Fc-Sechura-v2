/**
 * FASE 3 — Evaluaciones de competencias por posición.
 * Convive con `performanceService` (OVR FIFA) — no lo reemplaza.
 *
 * Colección: `competencias_jugador`
 * Schema:
 *   { alumnoId, posicion, competencias: { [nombre]: nivel (1-4) }, notas, evaluador }
 *   Usamos upsert con id = alumnoId para mantener un único documento por jugador.
 */
import { get, list, upsert, where, orderBy } from './firestoreClient';

const PATH = 'competencias_jugador';

export const competenciasService = {
  /** Devuelve evaluación de un alumno (o null si no existe). */
  obtener: (alumnoId) => get(PATH, alumnoId),

  /** Crea/actualiza la evaluación (upsert por alumnoId). */
  guardar: (alumnoId, data) => upsert(PATH, alumnoId, data),

  /** Lista evaluaciones por posición. */
  listarPorPosicion: (posicion) =>
    list(PATH, where('posicion', '==', posicion), orderBy('updatedAt', 'desc')),
};
