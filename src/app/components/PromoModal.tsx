// components/PromoModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const promoTexts = {
  en: {
    ribbon: 'Special Offer!',
    oldPrice: '10% OFF',
    newPrice: '20% OFF ',
    text:'First Web Page Development',
    ctaButton: 'Get a Quote!',
  },
  es: {
    ribbon: '¡Aprovecha!',
    oldPrice: '10% OFF',
    newPrice: '20% OFF',
    text:'Primera Páginas Web',
    ctaButton: '¡Cotiza Ahora!',
  },
  de: {
    ribbon: 'Angebot!',
    oldPrice: '10% RABATT',
    newPrice: '20% RABATT',
    text:'Erste Webseite Entwicklung',
    ctaButton: 'Angebot anfordern!',
  },
  zh: {
    ribbon: '特别优惠',
    oldPrice: '10% 折扣',
    newPrice: '20% 折扣',
    text:'首次网页开发',
    ctaButton: '获取报价',
  },
};

const slideImages = ['/logo_js.png', '/vet_mix.png', '/jaiselectus.png','/image_3_3.jpeg','/spa_mix.png'];

const slideVariants = {
  enter: { x: '100%', opacity: 0 },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  }
};

export const PromoModal = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as keyof typeof promoTexts;
  const texts = promoTexts[lang] || promoTexts.en;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    
  },[] );

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slideImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleClose = () =>  setTimeout(() => setIsOpen(false), 1000);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 w-full h-full z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-11/12 max-w-md"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 200 } }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* AQUÍ ESTÁ LA CORRECCIÓN: Se añadió "overflow-hidden" */}
            <div className="relative rounded-md overflow-hidden shadow-2xl shadow-black/50 bg-background-light dark:bg-slate-800">
              
              <div
                className="
                  absolute top-8 z-20 -left-12 transform -rotate-45 
                  w-48 py-1 text-center font-bold text-white
                  bg-primary-light dark:bg-primary-dark shadow-lg
                "
              >
                <h2 className="text-2xl" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                  {texts.ribbon}
                </h2>
              </div>
              
              <div className="absolute top-16 z-20 left-14 transform -rotate-45 font-bold text-white">
                 <p className="line-through text-slate-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  {texts.oldPrice}
                 </p>
                 <p className="text-2xl text-amber-400" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                  {texts.newPrice}
                 </p>
              </div>

         
              <div className="relative w-full h-[65vh] max-h-[500px] overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentIndex}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute w-full h-full"
                  >
                    <Image
                      src={slideImages[currentIndex]}
                      alt={`Promoción ${currentIndex + 1}`}
                     fill
                       className="object-cotain w-full h-full"
                    />
                  </motion.div>
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-black/30"></div>

                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 transition-all z-30"
                    aria-label="Cerrar modal"
                  >
                    <FaTimes size={20} />
                  </button>

                  <Link href={`${i18n.language}/cotiza`} onClick={handleClose}>
                    <motion.div
                      className="
                        px-8 py-3 font-semibold text-lg text-gray-300 rounded-sm
                        bg-primary-light/80 dark:bg-secondary-light/70 backdrop-blur-sm
                        border-2
                        hover:bg-primary-light dark:hover:bg-primary-dark
                        transition-all duration-300 shadow-lg cursor-pointer border-gray-300
                      "
                      whileHover={{ scale: 1.05,
                        boxShadow: '0px 0px 15px rgba(255, 255, 255, 0.3)'
                       }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {texts.ctaButton}
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};