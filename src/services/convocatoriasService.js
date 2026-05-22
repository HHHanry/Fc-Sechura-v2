import { list, create, update, orderBy, limit } from './firestoreClient';

const PATH = 'convocatorias';

export const convocatoriasService = {
  listar:    (n = 20) => list(PATH, orderBy('createdAt', 'desc'), limit(n)),
  crear:     (data) => create(PATH, data),
  actualizar:(id, data) => update(PATH, id, data),
};
