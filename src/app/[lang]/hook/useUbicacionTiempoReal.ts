'use client';

import { useState, useEffect, useRef } from 'react';

interface Coordenadas {
  latitud: number;
  longitud: number;
  heading: number | null;
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

    // Se lanza directo. Si iOS necesita pedir permiso, mostrará el popup.
    // Si el usuario acepta, el callback de éxito se dispara inmediatamente.
    const opcionesGps = {
      enableHighAccuracy: true, 
      timeout: 20000, // 20 segundos para el GPS de hardware de iOS
      maximumAge: 0 
    };

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (posicion) => {
        const nuevasCoords: Coordenadas = {
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
          heading: posicion.coords.heading
        };
        
        setUbicacion(nuevasCoords);
        setError(null); // Limpia errores previos si recuperó señal
      },
      (err) => {
        console.error('Error en watchPosition:', err);
        switch (err.code) {
          case 1: 
            setError('Permiso de ubicación denegado. Habilítalo en Ajustes de iPhone > Chrome.'); 
            break;
          case 2: 
            setError('Posición no disponible (GPS apagado o sin señal).'); 
            break;
          case 3: 
            setError('Tiempo de espera agotado al buscar señal GPS.'); 
            break;
          default:
            setError('Error desconocido de geolocalización.');
        }
      },
      opcionesGps
    );

    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, []); // Array vacío. Se ejecuta una vez al montar.

  return { ubicacion, error };
}