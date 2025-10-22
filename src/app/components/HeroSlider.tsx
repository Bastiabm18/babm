'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next'; // 1. Importar el hook

// Array con las rutas de las imágenes para pantallas grandes
const slideImages = [
  '/vet_mixx.png',
  '/spa_mixx.jpg',
  '/jai_mix.png',
  '/tech_mix.png',
];

// Array con las rutas de las imágenes para móviles (verticales)
const vertical_slideImages = [
  '/jaiselectus.png',
  '/logo_js.png',
  '/spa_mix.png',
  '/vet_mix.png',
];

// 2. Crear el objeto de traducciones para el título y el botón
const translations = {
  en: { 
    title: 'We Transform Ideas into Digital Reality',
    buttonText: 'Quote Your Project' 
  },
  es: { 
    title: 'Transformamos Ideas en Realidad Digital',
    buttonText: 'Cotiza tu Proyecto'
  },
  de: { 
    title: 'Wir verwandeln Ideen in digitale Realität',
    buttonText: 'Projekt anfragen'
  },
  zh: { 
    title: '我们将想法变为数字现实',
    buttonText: '项目报价'
  },
};


export default function HeroSlider() {
  const { i18n } = useTranslation(); // 3. Usar el hook
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Determina el set de imágenes a usar basado en el tamaño de la pantalla
  const images = isMobile ? vertical_slideImages : slideImages;

  // 4. Lógica para seleccionar el texto del idioma actual
  const lang = (i18n.language.split('-')[0] || 'es') as keyof typeof translations;
  const content = translations[lang] || translations.es;

  // Efecto para detectar el tamaño de la pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Punto de quiebre para móvil (tablets y más pequeños)
    };
    
    checkScreenSize(); // Comprueba al cargar
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Lógica para cambiar de slide
  const changeSlide = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection > 0) { // Siguiente
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    } else { // Anterior
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  // Efecto para el cambio automático de slides cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide(1); // Mueve a la siguiente imagen
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [images]); // Se reinicia si el set de imágenes cambia

  // Variantes para la animación de Framer Motion
  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    visible: {
      x: '0%',
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <section 
      className="relative w-[95vw] h-[70vh] mx-auto my-8 rounded-lg overflow-hidden shadow-2xl"
    >
      {/* Contenedor de la imagen con AnimatePresence */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute w-full h-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            className="object-fill"
            priority={currentIndex === 0} // Carga la primera imagen con prioridad
            sizes="95vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Filtro oscuro semi-transparente */}
      <div className="absolute inset-0 bg-gray-900/60 z-10"></div>

      {/* Contenido centrado (Botón) */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center p-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-6xl font-extrabold mb-6 text-shadow-lg"
        >
          {/* 5. Usar el texto dinámico */}
          {content.title}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href={`/${i18n.language}/cotiza`}>
            <span className="px-8 py-4 bg-primary-dark text-white font-bold text-lg rounded-md hover:bg-primary-light transition-colors duration-300 shadow-lg cursor-pointer">
              {/* 6. Usar el texto del botón dinámico */}
              {content.buttonText}
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Controles de navegación (flechas) */}
      <div className="absolute z-20 top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
        <button 
          onClick={() => changeSlide(-1)}
          className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors"
        >
          <FaChevronLeft size={24} />
        </button>
        <button 
          onClick={() => changeSlide(1)}
          className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors"
        >
          <FaChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
