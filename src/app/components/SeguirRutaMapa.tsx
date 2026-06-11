'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaLocationArrow, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Coordenadas exactas para la simulación de navegación en el Biobío
const COORDENADAS = {
  concepcion: { lng: -73.0498, lat: -36.8269 },
  santaJuana: { lng: -72.9364, lat: -37.1747 }
};

interface IndicacionPaso {
  texto: string;
  distancia: string;
  tipo: string;
}

export default function SeguirRutaMapa() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const marcadorConductorRef = useRef<mapboxgl.Marker | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [indicaciones, setIndicaciones] = useState<IndicacionPaso[]>([]);
  const [pasoActualIdx, setPasoActualIdx] = useState<number>(0);
  const [estaMutado, setEstaMutado] = useState(false);
  
  // Estados para controlar la simulación del viaje
  const [enSimulacion, setEnSimulacion] = useState(false);
  const geojsonRutaRef = useRef<[number, number][]>([]);
  const indiceRutaRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // 1. Sincronización del Tema (Dark/Light) exacto a tu lógica
  useEffect(() => {
    const evaluarTema = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    evaluarTema();
    const observador = new MutationObserver(evaluarTema);
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observador.disconnect();
  }, []);

  // 2. Inicializar el mapa 3D de Mapbox nativo
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    mapboxgl.accessToken = token;
    if (!token) return;

    const mapStyleId = isDarkMode ? 'navigation-night-v1' : 'navigation-day-v1';

    // Creamos la instancia con Pitch a 60° para lograr el efecto 3D en tercera persona
    const mapa = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${mapStyleId}`,
      center: [COORDENADAS.concepcion.lng, COORDENADAS.concepcion.lat],
      zoom: 14,
      pitch: 60, // Ángulo de inclinación (3D)
      bearing: 180, // Orientación inicial mirando hacia la salida al sur
      interactive: true
    });

    mapRef.current = mapa;

    // Crear marcador personalizado que simulará ser el vehículo
    const el = document.createElement('div');
    el.className = 'w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] transform rotate-45';
    el.innerHTML = '▲'; 
    
    const marcador = new mapboxgl.Marker(el)
      .setLngLat([COORDENADAS.concepcion.lng, COORDENADAS.concepcion.lat])
      .addTo(mapa);
    
    marcadorConductorRef.current = marcador;

    // Obtener la ruta desde Concepción a Santa Juana vía la "Ruta de la Madera" (Ruta 156)
   mapa.on('load', () => {
  // CORRECCIÓN: Configuración moderna de la atmósfera 3D para Mapbox v3+
  // Esto elimina el error de TypeScript y añade un horizonte realista
  mapa.setFog({
    'range': [0.5, 10],
    'color': isDarkMode ? '#242b3b' : '#ffffff',
    'high-color': isDarkMode ? '#161b24' : '#cbe2f6',
    'space-color': isDarkMode ? '#0b0e14' : '#a4c6eb',
    'horizon-blend': 0.5
  });

  obtenerRutaConIndicaciones(token, mapa);
});

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      mapa.remove();
    };
  }, [isDarkMode]);

  // 3. Consulta de la API de direcciones pidiendo los pasos detallados ('steps=true')
  const obtenerRutaConIndicaciones = async (token: string, mapa: mapboxgl.Map) => {
    const originStr = `${COORDENADAS.concepcion.lng},${COORDENADAS.concepcion.lat}`;
    const destStr = `${COORDENADAS.santaJuana.lng},${COORDENADAS.santaJuana.lat}`;
    
    // Crucial: Pasamos steps=true para que Mapbox mande las maniobras de texto paso a paso
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originStr};${destStr}?geometries=geojson&steps=true&overview=full&language=es&access_token=${token}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) return;

      const route = data.routes[0];
      geojsonRutaRef.current = route.geometry.coordinates;

      // Extraer y formatear los pasos para nuestro panel interactivo
      const pasosFormateados: IndicacionPaso[] = route.legs[0].steps.map((step: any) => ({
        texto: step.maneuver.instruction,
        distancia: `${Math.round(step.distance)} m`,
        tipo: step.maneuver.type
      }));

      setIndicaciones(pasosFormateados);

      // Dibujar la polilínea en el mapa 3D
      if (mapa.getSource('route')) {
        (mapa.getSource('route') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        });
      } else {
        mapa.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        mapa.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ff5722', 'line-width': 6, 'line-opacity': 0.85 }
        });
      }

      // Encuadre inicial enfocado al Origen
      mapa.flyTo({
        center: [COORDENADAS.concepcion.lng, COORDENADAS.concepcion.lat],
        zoom: 16,
        pitch: 65,
        bearing: 210 // Ángulo para mirar en dirección hacia San Pedro / Santa Juana
      });

    } catch (error) {
      console.error("Error cargando indicaciones de Mapbox:", error);
    }
  };

  // 4. Síntesis de voz automática para las indicaciones (Audio)
  const hablarIndicacion = (texto: string) => {
    if (estaMutado || typeof window === 'undefined') return;
    window.speechSynthesis.cancel(); // Detener cualquier instrucción previa rezagada
    const enunciar = new SpeechSynthesisUtterance(texto);
    enunciar.lang = 'es-CL'; // Acento chileno nativo si está disponible
    enunciar.rate = 1.0;
    window.speechSynthesis.speak(enunciar);
  };

  // Disparar audio cada vez que el index de la instrucción activa cambie durante el viaje
  useEffect(() => {
    if (indicaciones.length > 0 && enSimulacion) {
      hablarIndicacion(indicaciones[pasoActualIdx].texto);
    }
  }, [pasoActualIdx, indicaciones, enSimulacion]);

  // 5. Motor de Simulación Cinematográfica (Avanzar por la Ruta de la Madera)
const ejecutarSimulacionGiro = () => {
    const coords = geojsonRutaRef.current;
    if (coords.length === 0 || !mapRef.current || !marcadorConductorRef.current) return;

    const index = indiceRutaRef.current;
    if (index >= coords.length) {
      setEnSimulacion(false);
      return;
    }

    const puntoActual = coords[index];
    marcadorConductorRef.current.setLngLat([puntoActual[0], puntoActual[1]]);

    // Calcular la dirección/rumbo hacia el siguiente punto para inclinar y rotar el mapa dinámicamente
    if (index < coords.length - 1) {
      const siguientePunto = coords[index + 1];
      const bearingCalculado = calcularCursoEntrePuntos(puntoActual, siguientePunto);
      
      // CORRECCIÓN AQUÍ: Eliminamos 'easing' para evitar el conflicto de tipos
      mapRef.current.easeTo({
        center: [puntoActual[0], puntoActual[1]],
        bearing: bearingCalculado,
        pitch: 65,
        duration: 40
      });
    }

    // Lógica para avanzar las indicaciones según el progreso de la ruta
    const progresoPorcentaje = index / coords.length;
    const siguientePasoObjetivo = Math.min(
      Math.floor(progresoPorcentaje * indicaciones.length),
      indicaciones.length - 1
    );
    
    if (siguientePasoObjetivo !== pasoActualIdx) {
      setPasoActualIdx(siguientePasoObjetivo);
    }

    indiceRutaRef.current += 2; // Avanzar de a 2 nodos para la simulación
    animationFrameRef.current = requestAnimationFrame(ejecutarSimulacionGiro);
  };

  // Utilidad geométrica para calcular el rumbo (Bearing)
  const calcularCursoEntrePuntos = (p1: [number, number], p2: [number, number]) => {
    const lng1 = p1[0] * Math.PI / 180;
    const lng2 = p2[0] * Math.PI / 180;
    const lat1 = p1[1] * Math.PI / 180;
    const lat2 = p2[1] * Math.PI / 180;
    const dLon = lng2 - lng1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  };

  useEffect(() => {
    if (enSimulacion) {
      animationFrameRef.current = requestAnimationFrame(ejecutarSimulacionGiro);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [enSimulacion]);

  const reiniciarSimulacion = () => {
    indiceRutaRef.current = 0;
    setPasoActualIdx(0);
    setEnSimulacion(true);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* HUD Superior / Panel de Indicaciones Activas (Estilo GPS) */}
      {indicaciones.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-neutral-900 text-white p-4 rounded-lg shadow-xl border border-neutral-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center shadow-md animate-pulse">
              <FaLocationArrow className="text-xl text-white transform -rotate-45" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Siguiente Maniobra ({indicaciones[pasoActualIdx]?.distancia || '0m'})
              </span>
              <p className="text-sm md:text-base font-semibold text-neutral-100">
                {indicaciones[pasoActualIdx]?.texto || "Cargando ruta..."}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setEstaMutado(!estaMutado)}
            className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-300"
          >
            {estaMutado ? <FaVolumeMute className="text-lg text-red-400" /> : <FaVolumeUp className="text-lg text-green-400" />}
          </button>
        </motion.div>
      )}

      {/* Contenedor del Lienzo Mapbox 3D */}
      <div className="w-full h-96 md:h-[500px] rounded-lg shadow-2xl overflow-hidden border border-border-light dark:border-border-dark relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Leyenda de destino flotante sobre el mapa */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur px-3 py-1.5 rounded text-[11px] font-bold shadow-md text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 z-20">
          📍 Destino: Santa Juana (Biobío)
        </div>
      </div>

      {/* Panel de Mandos e Historial de Pasos */}
      <div className="bg-background-light_alt dark:bg-background-dark_alt p-4 rounded-lg shadow-md w-full">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-neutral-200">
              Simulador de Navegación Profesional 3D
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Concepción ➔ Santa Juana | Renderizado tridimensional con lectura de voz por API.
            </p>
          </div>

          {/* Botonera de control de simulación */}
          <div className="flex gap-2">
            <button
              onClick={() => setEnSimulacion(!enSimulacion)}
              className={`flex-1 md:flex-none text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm ${
                enSimulacion 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {enSimulacion ? <FaPause /> : <FaPlay />}
              {enSimulacion ? 'Pausar Viaje' : 'Iniciar Simulación'}
            </button>

            <button
              onClick={reiniciarSimulacion}
              className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-bold text-xs py-2.5 px-3 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all flex items-center justify-center"
              title="Reiniciar ruta"
            >
              <FaRedo />
            </button>
          </div>
        </div>

        {/* Listado colapsable de la bitácora completa de viaje */}
        <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Hoja de Ruta Pasos Completos
          </span>
          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
            {indicaciones.map((paso, idx) => (
              <div 
                key={idx}
                className={`text-[11px] p-2 rounded flex justify-between items-center transition-colors ${
                  idx === pasoActualIdx 
                    ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-500' 
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span>{paso.texto}</span>
                <span className="text-[10px] opacity-60 font-mono">{paso.distancia}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}