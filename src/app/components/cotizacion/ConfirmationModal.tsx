// components/ConfirmationModal.tsx
import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  texts: {
    title: string;
    message: string;
    confirmButton: string;
    cancelButton: string;
  };
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirm, texts }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()} // Evita que el click se propague al fondo
      >
        <FiAlertTriangle className="mx-auto text-5xl text-amber-500 mb-4" />

        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-3">{texts.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">{texts.message}</p>
        
        <div className="flex justify-center gap-4">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2 px-6 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-lg hover:opacity-90 transition"
          >
            {texts.cancelButton}
          </motion.button>
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2 px-6 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            {texts.confirmButton}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;