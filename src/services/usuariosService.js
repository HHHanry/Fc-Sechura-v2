import { list, get, upsert, remove } from './firestoreClient';

const PATH = 'usuarios';

export const usuariosService = {
  listar:    () => list(PATH),
  obtener:   (uid) => get(PATH, uid),
  upsert:    (uid, data) => upsert(PATH, uid, data),
  eliminar:  (uid) => remove(PATH, uid),
};
