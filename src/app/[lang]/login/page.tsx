'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa'; // 1. Importar el ícono de flecha
import Image from 'next/image'; // 2. Importar el componente Image
import Link from 'next/link'; // 3. Importar Link para el botón de volver

// Importaciones de Firebase y del AuthContext
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

type SupportedLang = 'en' | 'es' | 'de' | 'zh';

const translations: Record<SupportedLang, {
  loginTitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  cancel: string;
  login: string;
  loginWithGoogle: string;
}> = {
  en: {
    loginTitle: 'Login',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    cancel: 'Cancel',
    login: 'Log In',
    loginWithGoogle: 'Log In with Google',
  },
  es: {
    loginTitle: 'Iniciar Sesión',
    emailPlaceholder: 'Ingrese su correo',
    passwordPlaceholder: 'Ingrese su contraseña',
    cancel: 'Cancelar',
    login: 'Iniciar Sesión',
    loginWithGoogle: 'Iniciar Sesión con Google',
  },
  de: {
    loginTitle: 'Anmelden',
    emailPlaceholder: 'Geben Sie Ihre E-Mail ein',
    passwordPlaceholder: 'Geben Sie Ihr Passwort ein',
    cancel: 'Abbrechen',
    login: 'Anmelden',
    loginWithGoogle: 'Mit Google anmelden',
  },
  zh: {
    loginTitle: '登录',
    emailPlaceholder: '输入您的电子邮件',
    passwordPlaceholder: '输入您的密码',
    cancel: '取消',
    login: '登录',
    loginWithGoogle: '使用谷歌登录',
  },
};

export default function Login({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const lang = (['en', 'es', 'de', 'zh'] as SupportedLang[]).includes(params.lang as SupportedLang)
    ? (params.lang as SupportedLang)
    : 'en';
  const t = translations[lang];

  useEffect(() => {
    if (!loading && user) {
      router.push(`/${lang}/dashboard`);
    }
  }, [user, loading, router, lang]);

  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleGoogleLogin = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      if (loggedInUser) {
        const db = getFirebaseFirestore();
        const userDocRef = doc(db, "users", loggedInUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: loggedInUser.uid,
            email: loggedInUser.email,
            displayName: loggedInUser.displayName,
            photoURL: loggedInUser.photoURL,
            role: 'user'
          });
        }
      }
    } catch (err: any) {
      console.error('Error en el inicio de sesión con Google:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('No se pudo iniciar sesión con Google.');
      }
    }
  };
  
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login con email/contraseña no implementado');
    setError('Funcionalidad no implementada.');
  };

  return (
    <div className="min-h-screen w-full p-6 flex items-center justify-center bg-background-light dark:bg-background-dark relative">
      {/* Botón para volver a la página principal */}
      <Link href={`/${lang}`} className="absolute top-6 left-6 text-gray-600 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-light transition-colors">
        <FaArrowLeft size={24} />
      </Link>

      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          {/* Logo en lugar de FaCode */}
          <Image
            src="/babm_new_bg.png"
            alt="Logo"
            width={50}
            height={50}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold text-primary-light dark:text-primary-dark mt-2">
            {t.loginTitle}
          </h1>
        </div>
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="w-1/2 bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary-dark dark:hover:bg-primary-light transition-colors"
            >
              {t.login}
            </button>
          </div>
        </form>
        
        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="mx-4 text-gray-500 dark:text-gray-400">o</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          </svg>
          {t.loginWithGoogle}
        </button>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}