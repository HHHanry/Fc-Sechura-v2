import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from './auth-context-base';

const getUserDoc = async (firebaseUser) => {
  const uidSnap = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
  if (uidSnap.exists()) return { authDocId: uidSnap.id, ...uidSnap.data() };

  const email = firebaseUser.email?.toLowerCase().trim();
  if (!email) return null;

  const emailSnap = await getDoc(doc(db, 'usuarios', email));
  return emailSnap.exists() ? { authDocId: emailSnap.id, ...emailSnap.data() } : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const perfil = await getUserDoc(firebaseUser);
          if (perfil) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...perfil });
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, rol: 'invitado' });
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(firebaseUser
          ? { uid: firebaseUser.uid, email: firebaseUser.email, rol: 'invitado' }
          : null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
