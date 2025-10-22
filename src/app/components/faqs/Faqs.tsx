'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import { PublicFaq, getPublicFaqs } from './actions-faqs';

// Tipado para el contenido multilingüe
type MultilangContent = {
  en: string;
  es: string;
  de: string;
  zh: string;
};

// Traducciones para el título del componente
const translations = {
  en: { title: 'Frequently Asked Questions' },
  es: { title: 'Preguntas Frecuentes' },
  de: { title: 'Häufig gestellte Fragen' },
  zh: { title: '常见问题' },
};

export default function Faqs() {
  const { i18n } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<PublicFaq[]>([]);
  const [loading, setLoading] = useState(true);

  // Se usa useEffect para obtener los datos en el lado del cliente
  useEffect(() => {
    async function loadFaqs() {
      try {
        const fetchedFaqs = await getPublicFaqs();
        setFaqs(fetchedFaqs);
      } catch (error) {
        console.error("Failed to load FAQs", error);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, []);

  const lang = (i18n.language.split('-')[0] || 'es') as keyof MultilangContent;
  const content = translations[lang] || translations.es;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className="w-full py-20 flex justify-center items-center bg-primary-light/90 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-primary-dark dark:text-primary-light" />
      </section>
    );
  }

  if (faqs.length === 0) {
    return null; // No renderiza nada si no hay FAQs
  }

  return (
    <section className="w-full py-20 px-4 sm:px-8 bg-primary-light/90 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12"
        >
          {content.title}
        </motion.h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex justify-between items-center p-6 text-left gap-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.pregunta[lang] || faq.pregunta.es}
                  </h3>
                  <div className="text-primary-dark dark:text-primary-light text-xl flex-shrink-0">
                    <AnimatePresence initial={false} mode="wait">
                      <motion.div
                        key={isOpen ? 'minus' : 'plus'}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isOpen ? <FaMinus /> : <FaPlus />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-600 dark:text-gray-300">
                        <p className="whitespace-pre-wrap">{faq.respuesta[lang] || faq.respuesta.es}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
