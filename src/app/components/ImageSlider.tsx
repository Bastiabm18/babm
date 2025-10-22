'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';




// Estructura de datos: un array de objetos para cada proyecto del portafolio.
const newsItems = [
  {
    id: 1,
    desktop_img: 'image_1.png',
    mobile_img: 'vertical_1.jpg',
    title_key: 'title1',
    subtitle_key: 'subtitle1'
  },
  {
    id: 2,
    desktop_img: 'dash_babm.png',
    mobile_img: 'mapa.png',
    title_key: 'title2',
    subtitle_key: 'subtitle2'
  },
  {
    id: 3,
    desktop_img: 'proyecto2.jpg',
    mobile_img: 'vertical_3.jpg',
    title_key: 'title3',
    subtitle_key: 'subtitle3'
  },
  {
    id: 4,
    desktop_img: 'vet_2.png',
    mobile_img: 'vet_agenda.png',
    title_key: 'title4',
    subtitle_key: 'subtitle4'
  },
  {
    id: 5,
    desktop_img: 'jcs_1.png',
    mobile_img: 'jcs_2.png',
    title_key: 'title5',
    subtitle_key: 'subtitle5'
  },
   {
    id: 6,
    desktop_img: 'vet_en_ruta.png', // Usando imágenes de ejemplo
    mobile_img: 'vertical_1.jpg',
    title_key: 'title6',
    subtitle_key: 'subtitle6'
  }
];

// Variante de animación para la aparición de cada tarjeta
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, // Efecto de aparición en cascada
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

export default function NewsGrid() {
  const { t } = useTranslation();
  const router = useRouter();
const { i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // Contenedor de la grilla. En móvil es 1 columna, en desktop son 4.
    <div 
      onClick={() => router.push(`/${i18n.language}/projects?id=`)} 
    className="w-[95vw] cursor-pointer  mx-auto my-10 grid grid-cols-1 md:grid-cols-4 md:auto-rows-[200px] gap-4">

      {/* Mapeamos sobre las noticias para crear cada tarjeta */}
      {newsItems.map((item, index) => {
        // Clases para lograr el diseño asimétrico en desktop
        const desktopLayoutClasses = 
          index === 0 ? 'md:col-span-2 md:row-span-2' // La primera noticia es más grande
          : 'md:col-span-1';

        return (
          <motion.div
            key={item.id}
            className={`relative group w-full h-[60vh] md:h-auto overflow-hidden rounded-lg shadow-lg ${desktopLayoutClasses}`}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            {/* Imagen de fondo */}
            <Image
              src={`/${isMobile ? item.mobile_img : item.desktop_img}`}
              alt={t(item.title_key)}
              fill
              className=" w-full h-full group-hover:scale-105 transition-transform duration-300"
             
            />
            {/* Capa de gradiente para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            
            {/* Contenido de texto */}
            <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
              <h2 className="text-xl md:text-2xl font-bold leading-tight">
                {t(item.title_key)}
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                {t(item.subtitle_key)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}