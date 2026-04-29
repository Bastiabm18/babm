'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';
import Link from 'next/link';

// Única importación de Supabase
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';

type SupportedLang = 'en' | 'es' | 'de' | 'zh';

const translations: Record<SupportedLang, {
  loginTitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  cancel: string;
  login: string;
  loginWithGoogle: string;
}> = {
  en: { loginTitle: 'Login', emailPlaceholder: 'Enter your email', passwordPlaceholder: 'Enter your password', cancel: 'Cancel', login: 'Log In', loginWithGoogle: 'Log In with Google' },
  es: { loginTitle: 'Iniciar Sesión', emailPlaceholder: 'Ingrese su correo', passwordPlaceholder: 'Ingrese su contraseña', cancel: 'Cancelar', login: 'Iniciar Sesión', loginWithGoogle: 'Iniciar Sesión con Google' },
  de: { loginTitle: 'Anmelden', emailPlaceholder: 'Geben Sie Ihre E-Mail ein', passwordPlaceholder: 'Geben Sie Ihr Passwort ein', cancel: 'Abbrechen', login: 'Anmelden', loginWithGoogle: 'Mit Google anmelden' },
  zh: { loginTitle: '登录', emailPlaceholder: '输入您的电子邮件', passwordPlaceholder: '输入您的密码', cancel: '取消', login: '登录', loginWithGoogle: '使用谷歌登录' },
};

export default function Login({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lang = (['en', 'es', 'de', 'zh'] as SupportedLang[]).includes(params.lang as SupportedLang) ? (params.lang as SupportedLang) : 'en';
  const t = translations[lang];

  // Verificar si ya hay sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(`/${lang}/dashboard`);
      } else {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [router, lang]);

  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      // ---> LE PASAMOS EL LANG AQUÍ <---
      options: { redirectTo: `${window.location.origin}/api/auth/callback?lang=${lang}` },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      if (data.session) {
        // Llamamos a nuestra API para setear la cookie "supabaseAuthSession" y guardar en DB
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.session.access_token }),
        });
        router.push(`/${lang}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null; // Evita parpadeos mientras verifica sesión

  return (
    <div className="min-h-screen w-full p-6 flex items-center justify-center bg-primary-light dark:bg-background-dark relative">
      <Link href={`/${lang}`} className="absolute top-6 left-6 text-gray-600 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-light transition-colors">
        <FaArrowLeft size={24} />
      </Link>

      <div className="w-full max-w-md p-6 bg-background-light_alt dark:bg-background-dark_alt rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Image src="/babm_new_bg.png" alt="Logo" width={50} height={50} className="mx-auto" />
          <h1 className="text-2xl font-bold text-primary-light dark:text-primary-dark mt-2">{t.loginTitle}</h1>
        </div>
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-primary-light dark:bg-background-dark text-gray-900 dark:text-white" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-primary-light dark:bg-background-dark text-gray-900 dark:text-white" />
          
          <div className="flex justify-between gap-4">
            <button type="button" onClick={handleCancel} className="w-1/2 bg-orange-200 dark:bg-background-dark text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
              {t.cancel}
            </button>
            <button type="submit" disabled={isSubmitting} className="w-1/2 bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary-dark dark:hover:bg-primary-light transition-colors disabled:opacity-50">
              {isSubmitting ? '...' : t.login}
            </button>
          </div>
        </form>
        
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="mx-4 text-gray-500 dark:text-gray-400">o</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

            <motion.button
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} />
              {t.loginWithGoogle}
            </motion.button>
        
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}