/**
 * Wrappers genéricos sobre Firestore.
 * Toda página/hook debe pasar por aquí — nunca importar firebase/firestore directamente.
 */
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, limit, serverTimestamp, increment, arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase';

const docToObj = (d) => ({ id: d.id, ...d.data() });

/** Reserva un ID de Firestore sin escribir nada todavía. Útil para QR enlazado. */
export const newId = (path) => doc(collection(db, path)).id;

export const list = async (path, ...constraints) => {
  const ref = constraints.length
    ? query(collection(db, path), ...constraints)
    : collection(db, path);
  const snap = await getDocs(ref);
  return snap.docs.map(docToObj);
};

export const get = async (path, id) => {
  const snap = await getDoc(doc(db, path, id));
  return snap.exists() ? docToObj(snap) : null;
};

export const create = async (path, data) =>
  addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });

export const upsert = async (path, id, data) =>
  setDoc(doc(db, path, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });

export const update = async (path, id, data) =>
  updateDoc(doc(db, path, id), { ...data, updatedAt: serverTimestamp() });

export const remove = async (path, id) => deleteDoc(doc(db, path, id));

// Re-exports para uso ergonómico
export { where, orderBy, limit, serverTimestamp, increment, arrayUnion };
