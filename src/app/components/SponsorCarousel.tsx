// components/Sponsors.tsx
'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import NeonSign from './NeonSign';

// Textos
const sponsorsTexts = {
  en: { title: 'We proudly support' },
  es: { title: 'Auspiciador Oficial en ' },
  de: { title: 'Wir unterstützen' },
  zh: { title: '我们支持' },
};

// Array de logos
const logos = [
  { src: '/catiray.png', alt: 'Catiray', url: '#', name: 'Catiray FC' },
  { src: '/carrera.png', alt: 'Carrera', url: '#', name: 'Union Los Carrera' },
  { src: '/jaiselec_logo.png', alt: 'Jaiselec', url: 'https://jaiselec--jaiselec.us-central1.hosted.app/', name: 'Jaiselec' },
  { src: '/spaolimpo.ico', alt: 'Olimpo Spa', url: '#', name: 'Spa Olimpo' },
];

// Animaciones
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const Sponsors = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language as keyof typeof sponsorsTexts;
  const texts = sponsorsTexts[lang] || sponsorsTexts.en;

  return (
    <motion.section
      className="w-full bg-primary-light dark:bg-gray-900 text-text-light dark:text-text-dark py-12 px-4 flex flex-col items-center justify-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <motion.h2 
        className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-10 text-center"
        variants={itemVariants}
      >
      <NeonSign />  {texts.title}
      </motion.h2>

      <motion.div 
        className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4"
        variants={containerVariants}
      >
        {logos.map((logo, index) => (
          <motion.div
            key={index}
            className="flex items-center  justify-center p-4"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            <a 
              href={logo.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cursor-pointer flex flex-col items-center justify-center "
            >
              <div className="relative w-28 h-28  rounded-full dark:bg-gradient-to-tl from-gray-900 via-gray-600 to-gray-400  md:w-28 md:h-28">
                <Image 
                  src={logo.src} 
                  alt={logo.alt} 
                  fill
                  className="object-contain p-4   transition-all duration-300"
                />
              </div>
              <div className="text-center mt-2 text-md text-slate-700 dark:text-slate-300">
                <p>{logo.name}</p>
                 </div>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};