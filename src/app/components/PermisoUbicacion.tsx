'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaTimes, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function PermisoUbicacion() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);
    console.log("ubicacion componente");
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const permiso = localStorage.getItem('permisoUbicacion');
    // Si nunca ha decidido, le mostramos el modal tras 1 segundo
    if (!permiso) {
      const timer = setTimeout(() => setMostrarModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const otorgarAcceso = () => {
    setCargando(true);
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      () => {
        localStorage.setItem('permisoUbicacion', 'otorgado');
        setCargando(false);
        setMostrarModal(false);
        // Notificar al Hook de tiempo real que ya puede abrir el canal watchPosition
        window.dispatchEvent(new Event('permiso-ubicacion-otorgado'));
      },
      () => {
        localStorage.setItem('permisoUbicacion', 'denegado');
        setCargando(false);
        setMostrarModal(false);
      }
    );
  };

  const rechazarAcceso = () => {
    localStorage.setItem('permisoUbicacion', 'denegado');
    setMostrarModal(false);
  };

  return (
    <AnimatePresence>
      {mostrarModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-neutral-800 rounded-2xl p-6 max-w-sm w-full border border-neutral-700 shadow-2xl text-center"
          >
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <FaMapMarkerAlt className="w-6 h-6 text-blue-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Activar navegación</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Necesitamos acceso a tu GPS para calcular la ruta en tiempo real y mostrar tu progreso en el mapa.
            </p>

            <div className="flex gap-3">
              <button
                onClick={rechazarAcceso}
                className="flex-1 py-3 rounded-xl font-medium bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition-colors"
              >
                No, luego
              </button>
              
              <button
                onClick={otorgarAcceso}
                disabled={cargando}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                {cargando ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <FaCheck />
                    Permitir
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}