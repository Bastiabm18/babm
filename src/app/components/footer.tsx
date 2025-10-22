'use client';

import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { useState, useRef } from 'react';
import { link } from 'fs';

// Objeto con las traducciones para el footer
const footerTexts = {
  en: {
    motto: 'Innovative solutions for a modern world.',
    linksTitle: 'Quick Links',
    linkHome: 'Home',
    linkServices: 'Services',
    linkAbout: 'About Us',
    linkContact: 'Contact',
    linkQuotation: 'Get a Quote',
    hoursTitle: 'Opening Hours',
    weekdays: 'Mon - Fri',
    weekends: 'Sat & Sun',
    soccerDays: 'Closed (Soccer Days ⚽)',
    socialTitle: 'Follow Us',
    copyright: 'All rights reserved.'
  },
  es: {
    motto: 'Soluciones innovadoras para un mundo moderno.',
    linksTitle: 'Enlaces Rápidos',
    linkHome: 'Inicio',
    linkServices: 'Servicios',
    linkAbout: 'Nosotros',
    linkContact: 'Contacto',
    linkQuotation: 'Cotiza tu Proyecto',
    hoursTitle: 'Horario de Atención',
    weekdays: 'Lun - Vie',
    weekends: 'Sáb y Dom',
    soccerDays: 'Cerrado (Días de Fútbol ⚽)',
    socialTitle: 'Síguenos',
    copyright: 'Todos los derechos reservados.'
  },
  de: {
    motto: 'Innovative Lösungen für eine moderne Welt.',
    linksTitle: 'Schnell-Links',
    linkHome: 'Startseite',
    linkServices: 'Dienstleistungen',
    linkAbout: 'Über uns',
    linkContact: 'Kontakt',
    linkQuotation: 'Projekt anfragen',
    hoursTitle: 'Öffnungszeiten',
    weekdays: 'Mo - Fr',
    weekends: 'Sa & So',
    soccerDays: 'Geschlossen (Fußballtage ⚽)',
    socialTitle: 'Folgen Sie uns',
    copyright: 'Alle Rechte vorbehalten.'
  },
  zh: {
    motto: '为现代世界提供创新解决方案。',
    linksTitle: '快速链接',
    linkHome: '首页',
    linkServices: '服务',
    linkAbout: '关于我们',
    linkContact: '联系',
    linkQuotation: '项目报价',
    hoursTitle: '营业时间',
    weekdays: '周一至周五',
    weekends: '周六和周日',
    soccerDays: '休息 (足球日 ⚽)',
    socialTitle: '关注我们',
    copyright: '版权所有。'
  },
};

const socialLinks = [
  { icon: FaInstagram, href: 'https://instagram.com/bastiabm' },
  { icon: FaFacebook, href: 'https://facebook.com/bastian.andres.5437' },
  { icon: FaLinkedin, href: 'https://linkedin.com' },
  { icon: FaYoutube, href: 'https://youtube.com' },
];

// --- INICIO: Componente para las chispas ---
const Sparks = () => {
    return (
      <>
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-secondary-light dark:bg-secondary-dark"
            style={{
              boxShadow: "0 0 10px 2px #D8B4FE",
            }}
            initial={{ 
              y: (Math.random() - 0.5) * 15,
              x: (Math.random() - 0.5) * 15,
              scale: 0.5,
            }}
            animate={{
              y: [0, -Math.random() * 40 - 15, 70],
              x: (Math.random() - 0.5) * 80,
              scale: Math.random() * 1.2,
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 0.6 + 0.7,
              ease: ["easeOut", "easeIn"],
            }}
          />
        ))}
      </>
    );
  };
// --- FIN: Componente para las chispas ---

export function Footer() {
  const { i18n } = useTranslation();
  const texts = footerTexts[i18n.language as keyof typeof footerTexts] || footerTexts.en;
  
  const [isHovered, setIsHovered] = useState(false);

  return (
    <footer className="bg-primary-light/90 dark:bg-slate-800 text-text-dark/80">
      <div className="max-w-[95vw]  mx-auto px-4 sm:px-6 py-12">
        {/* Contenedor principal en Grid de 4 columnas para desktop, 1 para móvil */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Sección 1: Logo y Lema */}
          <div className="space-y-4 flex items-center justify-center flex-col">
            <Image src="/babm_deepx.png" alt="BABM Logo" width={150} height={50} />
            <p className="text-sm">{texts.motto}</p>
          </div>

          {/* Sección 2: Enlaces Rápidos */}
          <div className='flex flex-col items-center justify-start'>
            <h3 className="font-bold text-lg text-white mb-4">{texts.linksTitle}</h3>
            <ul className="flex flex-row items-center justify-center sm:flex-col gap-3   sm:space-y-2 ">
              <li><Link href={`/${i18n.language}`} className="hover:text-white transition-colors">{texts.linkHome}</Link></li>
              <li><Link href="#techstack" className="hover:text-white transition-colors">{texts.linkServices}</Link></li>
              <li><Link href="#about" className="hover:text-white transition-colors">{texts.linkAbout}</Link></li>
              <li><Link href="#contacto" className="hover:text-white transition-colors">{texts.linkContact}</Link></li>
              <li><Link href={`/${i18n.language}/cotiza`} className="hover:text-white transition-colors">{texts.linkQuotation}</Link></li>
            </ul>
          </div>

          {/* Sección 3: Horario de Atención */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4">{texts.hoursTitle}</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>{texts.weekdays}:</span>
                <span>9:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>{texts.weekends}:</span>
                <span>{texts.soccerDays}</span>
              </li>
            </ul>
          </div>
          
          {/* Sección 4: Redes Sociales */}
          <div className='flex flex-col items-center justify-start'>
            <h3 className="font-bold  text-lg text-white mb-4">{texts.socialTitle}</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>
          </div>

        </div>

        {/* --- INICIO DE LA SECCIÓN MODIFICADA --- */}
        <div 
          className="relative mt-12 pt-8 text-center text-sm cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Línea de fondo estática */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
          
          {/* Línea animada con efecto de soldadura */}
          <motion.div
            className="absolute top-0 left-0 h-[1px] bg-secondary-light dark:bg-secondary-dark"
            initial={{ width: '0%' }}
            animate={{ width: isHovered ? '100%' : '0%' }}
            transition={{ duration: 2, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Contenedor de efectos en la punta de la línea */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {/* --- CAMBIO: Se envuelve el contenido en un motion.div con una key para forzar el re-montaje --- */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div key="effects-wrapper" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-secondary-light dark:bg-secondary-dark"
                      style={{ boxShadow: "0 0 15px 5px #D8B4FE" }}
                      animate={{ scale: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <Sparks />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          <p>© {new Date().getFullYear()} BABM. {texts.copyright}</p>
        </div>
        {/* --- FIN DE LA SECCIÓN MODIFICADA --- */}
      </div>
    </footer>
  );
}
