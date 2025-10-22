'use client';

import { FC, useState, useEffect, useRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Iconos
import {
  FaHome, FaProjectDiagram, FaEnvelope, FaUser, FaSignInAlt,
  FaSun, FaMoon, FaChevronDown, FaAtom,
  FaNetworkWired,
  FaToolbox
} from 'react-icons/fa';

// --- INICIO: Componente para las chispas del menú principal ---
const MenuItemSparks = ({ isDark }: { isDark: boolean }) => {
  return (
    <AnimatePresence>
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          // --- CORRECCIÓN: Se usan clases de Tailwind para color y sombra ---
          className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400 shadow-amber-400' : 'bg-primary-light shadow-primary-light'} shadow-lg`}
          style={{
            top: '50%',
            left: '50%',
          }}
          initial={{ 
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 1,
          }}
          animate={{
            transform: [
              'translate(-50%, -50%) scale(1)',
              `translate(${(Math.random() - 0.5) * 80}px, ${Math.random() * 80 + 20}px) scale(0)`
            ],
            opacity: [1, 0.5, 0],
          }}
          transition={{
            duration: 4.0,
            ease: "easeOut",
            delay: 0.1
          }}
        />
      ))}
    </AnimatePresence>
  );
};
// --- FIN: Componente para las chispas del menú principal ---


// --- INICIO: Componente para las chispas del HOVER de cada ítem ---
const HoverSparks = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className="absolute top-full -mt-3 h-24 w-full">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          // --- CORRECCIÓN: Se usan clases de Tailwind para color y sombra ---
          className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-amber-400 shadow-amber-400' : 'bg-primary-light shadow-primary-light'} shadow-md`}
          style={{
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: 0, opacity: 1, scale: Math.random() * 0.7 + 0.5 }}
          animate={{ y: 60 + Math.random() * 30, opacity: 0 }}
          transition={{
            duration: 2.0,
            ease: "easeIn"
          }}
        />
      ))}
    </div>
  );
};
// --- FIN: Componente para las chispas del HOVER ---


// --- INICIO: Componente para cada ítem del menú con su animación de hover ---
const HoverMenuItem: FC<{
  item: MenuItem;
  angle: number;
  radius: number;
  isDark: boolean;
  isOpen: boolean;
  onLinkClick: () => void;
  itemVariants: any;
}> = ({ item, angle, radius, isDark, isOpen, onLinkClick, itemVariants }) => {
  const [isHovered, setIsHovered] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (linkRef.current) {
      setSize({
        width: linkRef.current.offsetWidth,
        height: linkRef.current.offsetHeight,
      });
    }
  }, [item.name]);

  const pillPath = `M ${size.height / 2},1 
                     L ${size.width - size.height / 2},1 
                     A ${size.height / 2 - 1},${size.height / 2 - 1} 0 0 1 ${size.width - size.height / 2},${size.height - 1} 
                     L ${size.height / 2},${size.height - 1} 
                     A ${size.height / 2 - 1},${size.height / 2 - 1} 0 0 1 ${size.height / 2},1 Z`;

  return (
    <motion.li
      className="absolute top-1/2 left-0"
      custom={angle}
      variants={itemVariants}
      style={{ transformOrigin: 'left center' }}
    >
      <Link
        href={item.href}
        ref={linkRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onLinkClick}
        className="relative flex items-center no-underline transition-all duration-300 rounded-full px-6 py-1 bg-primary-light/90 dark:bg-gray-200/30 text-gray-200 dark:text-white hover:!text-gray-300 dark:hover:!text-teal-300 hover:bg-gray-900/60 dark:hover:bg-gray-200/50"
        style={{ transform: `translateX(${radius}rem) rotate(${-angle}deg)` }}
        title={item.name}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              <motion.path
                d={pillPath}
                fill="none"
                className={isDark ? "stroke-amber-400" : "stroke-primary-light"}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathLength: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isHovered && <HoverSparks isDark={isDark} />}
        </AnimatePresence>

        <div className="relative flex items-center justify-center w-12 h-12 bg-gray-300/50 dark:bg-gray-700/50 rounded-full shadow-md" style={{ overflow: 'visible' }}>
          {item.icon}
          <AnimatePresence>
            {isOpen && <MenuItemSparks isDark={isDark} />}
          </AnimatePresence>
        </div>
        <span className="relative ml-4 font-bold text-sm tracking-wider whitespace-nowrap">
          {item.name}
        </span>
      </Link>
    </motion.li>
  );
};
// --- FIN: Componente para cada ítem del menú ---


// --- Tipos, Interfaces y Datos (sin cambios) ---
interface Language {
  code: string;
  name: string;
  flag: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: ReactNode;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇨🇱' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文',   flag: '🇨🇳' },
];

const InteractiveSideMenu: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const langDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[1];

  const menuItems: MenuItem[] = [
    { name: t('inicio'), href: `/${i18n.language}`, icon: <FaHome size={24} /> },
    { name: t('projects'), href: '#proyectos', icon: <FaProjectDiagram size={24} /> },
    { name: t('contact'), href: '#contacto', icon: <FaEnvelope size={22} /> },
    { name: t('about'), href: '#about', icon: <FaUser size={24} /> },
    { name: t('techstack'), href: '#techstack', icon: <FaToolbox size={24} /> },
    { name: t('login'), href: `/${i18n.language}/login`, icon: <FaSignInAlt size={24} /> },
  ];

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (customAngle: number) => ({
      opacity: 1,
      scale: 1,
      transform: `translateY(-50%) rotate(${customAngle}deg)`,
      transition: { type: "spring", stiffness: 120, damping: 12 }
    }),
  };
  
  const listVariants = {
    hidden: { transition: { when: "afterChildren" } },
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.08 } },
  };

  const radius = 10;
  
  const angles = [-78, -40, -15, 15, 40, 78];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>
    
      <motion.nav
        className="fixed top-1/2 left-0 -translate-y-1/2 z-50"
        initial={{ x: -64, y: "-50%" }}
        animate={{ x: isOpen ? 0 : -64, y: "-50%" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="relative w-40 h-80 flex items-center justify-start">
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                  <button onClick={() => setIsDark(!isDark)} className="text-white hover:text-lime-300 p-2 rounded-full transition-colors" aria-label="Toggle dark mode">
                    {isDark ? <FaSun size="1.2em" /> : <FaMoon size="1.2em" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              className="w-16 h-16 rounded-full font-goldman flex items-center justify-center focus:outline-none bg-secondary-light/50 dark:bg-primary-dark/80 text-white shadow-lg my-2"
              onClick={() => setIsOpen(!isOpen)}
              animate={{ rotate: isOpen ? -45 : 0 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <FaAtom size={32} />
            </motion.button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 10}} className="relative" ref={langDropdownRef}>
                  <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center space-x-1 text-white hover:text-lime-300 p-2 rounded-full transition-colors">
                    <span className="text-lg">{currentLanguage.flag}</span>
                    <FaChevronDown className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isLangDropdownOpen && (
                    <div className="absolute left-full bottom-0 ml-3 w-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-md shadow-lg py-1 z-20">
                      {languages.map((lang) => (
                        <button key={lang.code} onClick={() => changeLanguage(lang.code)} className="w-full flex items-center px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <span className="mr-3 text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="absolute w-full h-full">
            <AnimatePresence>
              {isOpen && (
                <motion.svg className="absolute w-80 h-80" style={{ top: '0rem', left: '-10rem' }} viewBox="0 0 320 320">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* --- CORRECCIÓN: Se elimina el gradiente y se usa className para el color del arco --- */}
                  <motion.path
                    d="M 187.8 2.4 A 160 160 0 0 1 187.8 317.6"
                    className={isDark ? "stroke-amber-400" : "stroke-teal-800"}
                    strokeWidth="1.5"
                    fill="none"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 1.0, ease: "easeInOut", delay: 0.1 }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </div>

          <motion.ul
            className="relative w-full h-full"
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            variants={listVariants}
          >
            <motion.div
              className="absolute top-0 left-0 w-40 h-80 bg-primary-light/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-r-full shadow-2xl -z-10"
              initial={false}
              animate={{ clipPath: isOpen ? "circle(100% at 25% 50%)" : "circle(8% at 25% 50%)" }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
            
            {menuItems.map((item, i) => (
              <HoverMenuItem
                key={item.name}
                item={item}
                angle={angles[i]}
                radius={radius}
                isDark={isDark}
                isOpen={isOpen}
                onLinkClick={() => setIsOpen(false)}
                itemVariants={itemVariants}
              />
            ))}
          </motion.ul>
        </div>
      </motion.nav>
    </>
  );
};

export default InteractiveSideMenu;
