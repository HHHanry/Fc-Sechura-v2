import { list, create, update, remove, where, orderBy, limit } from './firestoreClient';

const PATH = 'pagos';

export const pagosService = {
  listar:        () => list(PATH, orderBy('createdAt', 'desc')),
  ultimos:       (n = 10) => list(PATH, orderBy('createdAt', 'desc'), limit(n)),
  porAlumno:     (alumnoId) => list(PATH, where('alumnoId', '==', alumnoId)),
  completadosDelMes: (yyyymm) =>
    list(PATH, where('estado', '==', 'Completado'), orderBy('fecha', 'desc'))
      .then((all) => all.filter((p) => p.fecha?.startsWith(yyyymm))),
  registrar:     (data) => create(PATH, data),
  actualizar:    (id, data) => update(PATH, id, data),
  anular:        (id) => update(PATH, id, { estado: 'Anulado' }),
  eliminar:      (id) => remove(PATH, id),
};
