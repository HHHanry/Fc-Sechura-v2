import { list, create, update, remove, where } from './firestoreClient';

const PATH = 'deudas';

export const deudasService = {
  listar:     () => list(PATH),
  pendientes: () => list(PATH, where('estado', '==', 'Pendiente')),
  porAlumno:  (alumnoId) => list(PATH, where('alumnoId', '==', alumnoId)),
  crear:      (data) => create(PATH, { estado: 'Pendiente', ...data }),
  marcarPagada: (id) => update(PATH, id, { estado: 'Pagada' }),
  reabrir:    (id) => update(PATH, id, { estado: 'Pendiente', fechaPago: null }),
  eliminar:   (id) => remove(PATH, id),
};
