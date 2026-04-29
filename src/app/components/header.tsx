'use client';

import { FC, useState, useEffect, useRef, ReactNode, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaSun, FaMoon, FaChevronDown, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import NeonSign from './NeonSign';

// 1. Importaciones para la autenticación
import { useAuth } from '@/context/AuthContext';
import { getFirebaseAuth } from '../../lib/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import Image from 'next/image';

// Definimos el tipo para cada objeto de idioma
interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇨🇱' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文',   flag: '🇨🇳' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  // 2. Obtenemos el usuario del contexto
  const { user, loading } = useAuth();

  const [isDark, setIsDark] = useState(true);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Estado para el menú de usuario

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null); // Ref para el menú de usuario

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Hook para cerrar los menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    const newPath = pathname.replace(/^\/(en|es|de|zh)/, `/${langCode}`);
    i18n.changeLanguage(langCode).then(() => {
      router.push(newPath, { scroll: false }); 
      setIsLangDropdownOpen(false);
    });
  };

  // 3. Función para cerrar sesión
  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    try {
      await signOut(auth);
      setIsUserMenuOpen(false);
      // El AuthContext se encargará de llamar a la API para borrar la cookie
      // y el router te redirigirá si estás en una página protegida
      router.push(`/${i18n.language}`);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const currentLanguage = languages.find(l => l.code === i18n.language);

  // --- Sub-componente para el selector de idioma ---
  const LanguageSwitcher = () => (
    <div className="relative z-30" ref={langDropdownRef}>
      <button
        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm transition-colors"
      >
        <span className="text-base">{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
        <FaChevronDown className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isLangDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-gray-700/90 dark:bg-background-dark/90 backdrop-blur-sm rounded-md shadow-lg py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="w-full flex items-center px-4 py-2 text-sm hover:bg-white/10"
            >
              <span className="mr-3 text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // 4. Sub-componente para el menú de usuario (ACTUALIZADO)
  const UserMenu = () => (
    <div className="relative z-30" ref={userMenuRef}>
      <button 
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
        className="w-10 h-10 rounded-full border-2 border-secondary-dark hover:border-white transition-colors flex items-center justify-center bg-gray-600/50 hover:bg-gray-600"
      >
        <FaUser className="text-white"/>
      </button>
      {isUserMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700/90 dark:bg-background-dark/90 backdrop-blur-sm rounded-md shadow-lg py-1">
          <Link href={`/${i18n.language}/dashboard`} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10" onClick={() => setIsUserMenuOpen(false)}>
            Dashboard
          </Link>
          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10">
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className=" sticky left-0 top-0 z-20 bg-primary-light dark:bg-background-dark text-white shadow-md backdrop-blur-sm bg-opacity-80"
    >
      <nav className="container w-full mx-auto flex justify-between items-center px-4 py-3">
        <div className="flex flex-row items-center space-x-4">
          {/* NOTA: Volví a poner Image aquí abajo porque tu Logo sí lo usa */}
          <Link href={`/${i18n.language}`} className=" md:block  text-lg font-semibold hover:text-gray-300 transition-colors">
            <Image
              src="/babm_new_bg.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-auto h-10"
            />
          </Link>
          <NeonSign />
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          {/* 5. Renderizado condicional */}
          {!loading && (
            user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setIsDark(!isDark)}
                className="text-lg hover:bg-white/10 p-2 rounded-full transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <FaSun /> : <FaMoon />}
              </button>
            )
          )}
        </div>
      </nav>
    </motion.header>
  );
}