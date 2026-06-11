'use client';

import { useState, useEffect, useRef } from 'react';

interface Coordenadas {
  latitud: number;
  longitud: number;
  heading: number | null; // Rumbo/dirección del dispositivo en grados
}

export function useUbicacionTiempoReal() {
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('La geolocalización no está soportada en este entorno.');
      return;
    }

    // Función para activar el rastreo activo
    const iniciarRastreo = () => {
      const opcionesGps = {
        enableHighAccuracy: true, // Forzar uso de GPS de alta precisión, no solo antenas de red
        timeout: 15000,
        maximumAge: 0 // Evitar datos cacheados obsoletos
      };

      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (posicion) => {
          const nuevasCoords: Coordenadas = {
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
            heading: posicion.coords.heading // Útil para rotar la cámara de Mapbox hacia donde mira el auto
          };
          
          setUbicacion(nuevasCoords);
          setError(null);

          // Sincronizar con almacenamiento local para persistencia rápida
          localStorage.setItem('ultimaUbicacionGPS', JSON.stringify(nuevasCoords));
          
          // Emitir un evento global para que Mapbox lo cachee instantáneamente
          window.dispatchEvent(new CustomEvent('gps-update', { detail: nuevasCoords }));
        },
        (err) => {
          console.error('⚠️ Error en watchPosition:', err);
          switch (err.code) {
            case 1: setError('Permiso de ubicación denegado.'); break;
            case 2: setError('Posición no disponible (GPS apagado).'); break;
            case 3: setError('Tiempo de espera agotado.'); break;
          }
        },
        opcionesGps
      );
    };

    // Si ya tenemos el permiso otorgado previamente en localStorage, iniciamos directo
    const permisoPrevio = localStorage.getItem('permisoUbicacion');
    if (permisoPrevio === 'otorgado') {
      iniciarRastreo();
    }

    // Escuchar si el usuario acepta el modal de permisos en tiempo de ejecución
    const manejarPermisoOtorgado = () => {
      if (!geoWatchIdRef.current) iniciarRastreo();
    };

    window.addEventListener('permiso-ubicacion-otorgado', manejarPermisoOtorgado);

    return () => {
      // Limpieza crítica: Apagar el hardware de GPS al desmontar el componente para no gastar batería
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
      window.removeEventListener('permiso-ubicacion-otorgado', manejarPermisoOtorgado);
    };
  }, []);

  return { ubicacion, error };
}