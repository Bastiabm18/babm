'use client';

import { useState } from 'react';
import { Faq, deleteFaq } from '@/app/[lang]/dashboard/faq/actions';
import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqsTableProps {
  faqs: Faq[];
  onEdit: (faq: Faq) => void;
  onFaqDeleted: (faqId: string) => void;
}

export default function FaqsTable({ faqs, onEdit, onFaqDeleted }: FaqsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (faqId: string) => {
    setDeletingId(faqId);
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    setModalOpen(false);
    setDeletingId(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const result = await deleteFaq(deletingId);
    if (result.success) {
      onFaqDeleted(deletingId);
    } else {
      alert(result.message);
    }
    setIsDeleting(false);
    closeDeleteModal();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Preguntas Frecuentes</h2>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Pregunta (Español)</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Fecha de Creación</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map(faq => (
              <tr key={faq.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                {/* ✅ FIX: Muestra solo la pregunta en español */}
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{faq.pregunta.es}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${faq.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {faq.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(faq.fechaCreacion).toLocaleDateString()}</td>
                <td className="px-6 py-4 flex items-center gap-4">
                  <button onClick={() => onEdit(faq)} className="text-blue-500 hover:text-blue-700"><FaEdit size={18} /></button>
                  <button onClick={() => openDeleteModal(faq.id)} className="text-red-500 hover:text-red-700"><FaTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal de Confirmación */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar Eliminación</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                ¿Estás seguro de que quieres eliminar esta pregunta?
              </p>
              <div className="mt-6 flex justify-end gap-4">
                <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center">
                  {isDeleting && <FaSpinner className="animate-spin mr-2" />}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
