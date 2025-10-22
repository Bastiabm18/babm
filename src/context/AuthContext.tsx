// context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import Spinner from '@/app/components/Spinner';
import { useTranslation } from 'react-i18next';

// Define la interfaz para el valor del contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      const lang = i18n.language;

      // ✅ FIX: Nos aseguramos de que 'lang' no sea undefined antes de llamar a la API.
      if (!lang || lang === 'undefined') {
        console.log("AuthContext: Esperando a que se determine el idioma.");
        return; // No hacemos nada si el idioma aún no está listo.
      }

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch(`/${lang}/api/auth/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } catch (error) {
          console.error('Error creating server session:', error);
        }
      } else {
        try {
          await fetch(`/${lang}/api/auth/session`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Error deleting server session:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [i18n.language, user]); // Se añade 'user' a las dependencias para re-evaluar si cambia

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
