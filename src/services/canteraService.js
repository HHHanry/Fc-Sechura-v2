/**
 * FASE 4 — Cantera y proyección.
 *
 * Colección: `cantera_proyeccion`
 * Schema:
 *   { alumnoId, potencial, alertas: string[], notas, evaluador }
 *   Upsert con id = alumnoId (un documento por jugador).
 */
import { get, list, upsert, where, orderBy } from './firestoreClient';

const PATH = 'cantera_proyeccion';

export const canteraService = {
  obtener: (alumnoId) => get(PATH, alumnoId),

  guardar: (alumnoId, data) => upsert(PATH, alumnoId, data),

  listarTodos: () => list(PATH, orderBy('updatedAt', 'desc')),

  listarPorPotencial: (potencial) =>
    list(PATH, where('potencial', '==', potencial), orderBy('updatedAt', 'desc')),
};
