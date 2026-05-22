import { list, get, create, upsert, update, remove, newId } from './firestoreClient';

const PATH = 'alumnos';

export const alumnosService = {
  listar:      () => list(PATH),
  obtener:     (id) => get(PATH, id),
  crear:       (data) => create(PATH, data),
  /** Reserva un ID antes de escribir — el QR puede apuntar al ID antes de existir el doc. */
  reservarId:  () => newId(PATH),
  crearConId:  (id, data) => upsert(PATH, id, data),
  actualizar:  (id, data) => update(PATH, id, data),
  eliminar:    (id) => remove(PATH, id),
};
