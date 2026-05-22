import { list, create, remove, orderBy } from './firestoreClient';

const PATH = 'tacticas';

export const tacticasService = {
  listar:    () => list(PATH, orderBy('createdAt', 'desc')),
  guardar:   (data) => create(PATH, data),
  eliminar:  (id) => remove(PATH, id),
};
