'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Service, createOrUpdateService } from '@/app/[lang]/dashboard/servicios/actions';
import { FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ServiceFormProps {
  editingService: Service | null;
  onCancelEdit: () => void;
  onServiceSaved: (savedService: Service) => void;
}

export default function ServiceForm({ editingService, onCancelEdit, onServiceSaved }: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Cuando el modo de edición cambia, resetea el formulario si es necesario
  useEffect(() => {
    if (!editingService) {
      formRef.current?.reset();
    }
  }, [editingService]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const result = await createOrUpdateService(formData);
    
    if (result.success && result.service) {
      onServiceSaved(result.service); // Llama al callback para actualizar la tabla
      if (editingService) onCancelEdit(); // Cierra el modo edición
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
        {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="serviceId" value={editingService?.id || ''} />
        
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Servicio</label>
          <input type="text" name="nombre" id="nombre" defaultValue={editingService?.nombre} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark focus:border-primary-dark"/>
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
          <textarea name="descripcion" id="descripcion" rows={3} defaultValue={editingService?.descripcion} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark focus:border-primary-dark"></textarea>
        </div>

        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio</label>
          <input type="number" name="precio" id="precio" defaultValue={editingService?.precio} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark focus:border-primary-dark"/>
        </div>
        
        <div className="flex items-center">
            <input type="checkbox" name="activo" id="activo" defaultChecked={editingService?.activo ?? true} className="h-4 w-4 text-primary-dark focus:ring-primary-dark border-gray-300 rounded" />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Activo</label>
        </div>
        
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center px-4 py-2 bg-primary-dark text-white rounded-md hover:bg-primary-dark/90 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Guardar Servicio'}
          </button>
          {editingService && (
            <button type="button" onClick={onCancelEdit} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Cancelar Edición
            </button>
          )}
        </div>
        {message && <p className={`text-sm mt-2 ${message.includes('Error') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{message}</p>}
      </form>
    </motion.div>
  );
}
