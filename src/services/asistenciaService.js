import { list, create, update, remove, where, orderBy } from './firestoreClient';

const PATH = 'asistencias';

export const asistenciaService = {
  delDia:    (fechaDmy) => list(PATH, where('fecha', '==', fechaDmy), orderBy('createdAt', 'desc')),
  porAlumno: (alumnoId) => list(PATH, where('alumnoId', '==', alumnoId)),
  porRango:  (desde, hasta) =>
    list(PATH, where('fecha', '>=', desde), where('fecha', '<=', hasta)),
  registrar: (data) => create(PATH, data),
  actualizar:(id, data) => update(PATH, id, data),
  eliminar:  (id) => remove(PATH, id),
};
