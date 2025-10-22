'use client';

import { motion } from 'framer-motion'; // Ya no se necesita AnimatePresence aquí
import { FiX } from 'react-icons/fi';

interface EmailModalProps {
  onClose: () => void;
  texts: {
    title: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    sendButton: string;
  };
}

// El componente ahora retorna un Fragment (<>) con los dos elementos motion
export default function EmailModal({ onClose, texts }: EmailModalProps) {
  return (
    <>
      {/* Fondo con blur y Z-INDEX AUMENTADO */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Contenido del Modal y Z-INDEX AUMENTADO */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: '-50%', x: '-50%' }}
        animate={{ scale: 1, opacity: 1, y: '-50%', x: '-50%' }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="fixed top-1/2 left-1/2 z-[1300] w-[90vw] max-w-md p-6 rounded-lg bg-background-light dark:bg-slate-800 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-text-light dark:hover:text-text-dark transition-colors"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-text-dark">{texts.title}</h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <input
            type="email"
            placeholder={texts.emailPlaceholder}
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 text-text-light dark:text-text-dark border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <textarea
            placeholder={texts.messagePlaceholder}
            rows={4}
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700 text-text-light dark:text-text-dark border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-primary-light dark:bg-primary-dark text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {texts.sendButton}
          </motion.button>
        </form>
      </motion.div>
    </>
  );
}