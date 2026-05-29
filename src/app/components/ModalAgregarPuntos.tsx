'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaTimes, FaMapMarkerAlt, FaMagic } from 'react-icons/fa';

interface PuntoRuta {
  nombre: string;
  lng: string;
  lat: string;
}

interface ModalAgregarPuntosProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerarRuta: (puntos: PuntoRuta[]) => void;
}

export default function ModalAgregarPuntos({ isOpen, onClose, onGenerarRuta }: ModalAgregarPuntosProps) {
  // Inicializamos con Origen y Destino vacíos
  const [puntos, setPuntos] = useState<PuntoRuta[]>([
    { nombre: 'Origen (Ej: Concepción)', lng: '-73.0503', lat: '-36.8261' },
    { nombre: 'Destino (Ej: Los Ángeles)', lng: '-72.3517', lat: '-37.4697' }
  ]);

  if (!isOpen) return null;

  // Añadir una parada intermedia en el arreglo antes del destino final
  const agregarParadaIntermedia = () => {
    const nuevosPuntos = [...puntos];
    // Insertamos la nueva parada justo antes del último elemento (Destino)
    nuevosPuntos.splice(nuevosPuntos.length - 1, 0, { nombre: `Parada ${nuevosPuntos.length - 1}`, lng: '', lat: '' });
    setPuntos(nuevosPuntos);
  };

  // Eliminar una parada específica
  const eliminarParada = (index: number) => {
    if (puntos.length <= 2) return; // No se puede eliminar si solo queda origen y destino
    const nuevosPuntos = puntos.filter((_, i) => i !== index);
    setPuntos(nuevosPuntos);
  };

  // Manejar el cambio de texto en los inputs
  const handleInputChange = (index: number, campo: keyof PuntoRuta, valor: string) => {
    const nuevosPuntos = [...puntos];
    nuevosPuntos[index][campo] = valor;
    setPuntos(nuevosPuntos);
  };

  // Botón rápido para rellenar datos válidos de prueba y agilizar el debug
  const cargarDatosPruebaBioBio = () => {
    setPuntos([
      { nombre: 'Concepción (Inicio)', lng: '-73.0503', lat: '-36.8261' },
      { nombre: 'Coronel (Hito 1)', lng: '-73.1364', lat: '-37.0315' },
      { nombre: 'Lota (Hito 2)', lng: '-73.1592', lat: '-37.0945' },
      { nombre: 'Lebu (Destino)', lng: '-73.6542', lat: '-37.6104' }
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar que no existan campos vacíos
    const camposVacios = puntos.some(p => !p.lng || !p.lat);
    if (camposVacios) {
      alert("Por favor, rellena todas las coordenadas de Latitud y Longitud.");
      return;
    }
    onGenerarRuta(puntos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900_alt">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary-light dark:text-primary-dark" /> Configurar Ruta Personalizada Dinámica
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Puntos del Itinerario</label>
            <button 
              type="button" 
              onClick={cargarDatosPruebaBioBio}
              className="text-[11px] flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-1 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <FaMagic /> Autocompletar Ruta de Prueba
            </button>
          </div>

          {puntos.map((punto, index) => {
            const esOrigen = index === 0;
            const esDestino = index === puntos.length - 1;

            return (
              <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded min-w-[65px] text-center ${
                  esOrigen ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 
                  esDestino ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                }`}>
                  {esOrigen ? 'Inicio' : esDestino ? 'Destino' : `Hito ${index}`}
                </span>

                <input
                  type="text"
                  placeholder="Nombre o ID del lugar"
                  value={punto.nombre}
                  onChange={(e) => handleInputChange(index, 'nombre', e.target.value)}
                  className="w-full sm:flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-light"
                />

                <input
                  type="text"
                  placeholder="Longitud (Lng)"
                  value={punto.lng}
                  onChange={(e) => handleInputChange(index, 'lng', e.target.value)}
                  className="w-full sm:w-28 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-slate-800 dark:text-slate-100 font-mono"
                />

                <input
                  type="text"
                  placeholder="Latitud (Lat)"
                  value={punto.lat}
                  onChange={(e) => handleInputChange(index, 'lat', e.target.value)}
                  className="w-full sm:w-28 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-slate-800 dark:text-slate-100 font-mono"
                />

                {!esOrigen && !esDestino && (
                  <button
                    type="button"
                    onClick={() => eliminarParada(index)}
                    className="text-red-500 hover:text-red-700 p-2 dark:hover:text-red-400"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={agregarParadaIntermedia}
            className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light transition-colors mt-2"
          >
            <FaPlus /> Añadir Parada Intermedia
          </button>
        </form>

        {/* Footer Acciones */}
        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900_alt">
          <button 
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 transition-opacity"
          >
            Trazar Ruta en Mapa
          </button>
        </div>
      </motion.div>
    </div>
  );
}