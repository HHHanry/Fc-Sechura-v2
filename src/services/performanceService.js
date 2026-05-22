import { list, create, where, orderBy } from './firestoreClient';
import { alumnosService } from './alumnosService';
import { calculateOVR } from '../config/businessRules';

// Mantenemos 'stats' para preservar el histórico ya guardado por la versión legacy.
const PATH_EVAL = 'stats';

export const performanceService = {
  evaluacionesDeAlumno: (alumnoId) =>
    list(PATH_EVAL, where('alumnoId', '==', alumnoId), orderBy('fecha', 'desc')),

  registrarEvaluacion: async ({ alumnoId, alumnoNombre, stats, datosFisicos }) => {
    const ovr = calculateOVR(stats);
    const fecha = new Date().toISOString().split('T')[0];

    // 1. Persiste la evaluación histórica.
    await create(PATH_EVAL, { alumnoId, alumnoNombre, ...stats, ratingGlobal: ovr, fecha });

    // 2. Actualiza el perfil del alumno con stats + OVR para portal público.
    await alumnosService.actualizar(alumnoId, {
      ...stats, ...datosFisicos, ovr, rating: ovr, ultimaEvaluacion: fecha,
    });

    return { ovr, fecha };
  },
};
