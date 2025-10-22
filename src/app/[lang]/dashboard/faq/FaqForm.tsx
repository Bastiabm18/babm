'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Faq, createOrUpdateFaq } from '@/app/[lang]/dashboard/faq/actions';
import { FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface FaqFormProps {
  editingFaq: Faq | null;
  onCancelEdit: () => void;
  onFaqSaved: (savedFaq: Faq) => void;
}

const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
];

export default function FaqForm({ editingFaq, onCancelEdit, onFaqSaved }: FaqFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('es');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // This effect handles resetting the form when the editing state is cancelled
    if (!editingFaq) {
      formRef.current?.reset();
    }
  }, [editingFaq]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const result = await createOrUpdateFaq(formData);
    
    if (result.success && result.faq) {
      onFaqSaved(result.faq);
      if (editingFaq) {
        onCancelEdit();
      } else {
        // ✅ FIX: Resets the form fields after creating a new FAQ
        formRef.current?.reset();
      }
    }
    
    setMessage(result.message);
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {editingFaq ? 'Editar Pregunta Frecuente' : 'Crear Nueva Pregunta'}
      </h2>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setActiveTab(lang.code)}
              className={`${
                activeTab === lang.code
                  ? 'border-primary-dark dark:border-primary-light text-primary-dark dark:text-primary-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {lang.name}
            </button>
          ))}
        </nav>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="faqId" value={editingFaq?.id || ''} />
        
        {languages.map(lang => (
          <div key={lang.code} className={activeTab === lang.code ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label htmlFor={`pregunta_${lang.code}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pregunta ({lang.name})</label>
                <textarea name={`pregunta_${lang.code}`} id={`pregunta_${lang.code}`} rows={2} defaultValue={editingFaq?.pregunta[lang.code as keyof typeof editingFaq.pregunta]} required className="mt-1 block w-full max-w-xl px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor={`respuesta_${lang.code}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Respuesta ({lang.name})</label>
                <textarea name={`respuesta_${lang.code}`} id={`respuesta_${lang.code}`} rows={5} defaultValue={editingFaq?.respuesta[lang.code as keyof typeof editingFaq.respuesta]} required className="mt-1 block w-full max-w-xl px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"></textarea>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex items-center pt-4">
            <input type="checkbox" name="activo" id="activo" defaultChecked={editingFaq?.activo ?? true} className="h-4 w-4 text-primary-dark focus:ring-primary-dark border-gray-300 rounded" />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Activo</label>
        </div>
        
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full max-w-xs flex justify-center items-center px-4 py-2 bg-primary-dark text-white rounded-md hover:bg-primary-dark/90 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Guardar Pregunta'}
          </button>
          {editingFaq && (
            <button type="button" onClick={onCancelEdit} className="w-full max-w-xs px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Cancelar Edición
            </button>
          )}
        </div>
        {message && <p className={`text-sm mt-2 ${message.includes('Error') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{message}</p>}
      </form>
    </motion.div>
  );
}
