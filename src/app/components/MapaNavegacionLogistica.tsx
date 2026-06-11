'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaLocationArrow, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { FiCrosshair, FiX, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useUbicacionTiempoReal } from '../[lang]/hook/useUbicacionTiempoReal';

const DEFAULT_CENTER: [number, number] = [-73.0498, -36.8270];

type EstadoMapa = 'cargando' | 'token-invalido' | 'error-gl' | 'listo';
type EstadoNavegacion = 'libre' | 'cuenta_regresiva' | 'navegando';

interface IndicacionPaso {
  texto: string;
  distancia: string;
  tipo: string;
}

export default function MapaNavegacionLogistica() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const marcadorUsuarioRef = useRef<mapboxgl.Marker | null>(null);
  const marcadorDestinoRef = useRef<mapboxgl.Marker | null>(null);
  
  const prevLocationRef = useRef<[number, number] | null>(null);
  const distanciaRecorridaRef = useRef<number>(0);
  const distanciaAcumuladaPasosRef = useRef<number[]>([]);
  
  const ultimaPosValidaRef = useRef<[number, number] | null>(null);
  const ultimoHeadingValidoRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { ubicacion, error: errorGps } = useUbicacionTiempoReal();
  const [destino, setDestino] = useState<[number, number] | null>(null);
  const [distanciaEstimada, setDistanciaEstimada] = useState<string | null>(null);
  
  const [vistaActiva, setVistaActiva] = useState<'panel' | 'mapa'>('panel');
  const [estadoMapa, setEstadoMapa] = useState<EstadoMapa>('cargando');
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [estaMontado, setEstaMontado] = useState(false);

  const [indicaciones, setIndicaciones] = useState<IndicacionPaso[]>([]);
  const [pasoActualIdx, setPasoActualIdx] = useState<number>(0);
  const [estaMutado, setEstaMutado] = useState(false);
  
  const [mapaDescentrado, setMapaDescentrado] = useState<boolean>(false);
  const [panelMinimizado, setPanelMinimizado] = useState<boolean>(false);
  
  const [estadoNavegacion, setEstadoNavegacion] = useState<EstadoNavegacion>('libre');
  const [segundosRestantes, setSegundosRestantes] = useState<number>(5);

  useEffect(() => {
    if (vistaActiva !== 'mapa') return;
    setEstadoMapa('cargando');
    setErrorDetalle(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setEstaMontado(true);
      });
    });
  }, [vistaActiva]);

  useEffect(() => {
    if (vistaActiva !== 'mapa') return;
    if (!estaMontado) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      setEstadoMapa('token-invalido');
      setErrorDetalle('NEXT_PUBLIC_MAPBOX_TOKEN no esta definido en .env.local');
      return;
    }

    if (!token.startsWith('pk.')) {
      setEstadoMapa('token-invalido');
      setErrorDetalle(`Token invalido. Debe empezar con "pk."`);
      return;
    }

    const rect = mapContainerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setEstaMontado(false);
      setTimeout(() => setEstaMontado(true), 150);
      return;
    }

    mapboxgl.accessToken = token;

    try {
      const mapa = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: DEFAULT_CENTER,
        zoom: 16,
        pitch: 0, // INICIO PLANO
        bearing: 0,
        antialias: true
      });

      mapRef.current = mapa;

      mapa.on('dragstart', () => {
        setMapaDescentrado(true);
      });

      mapa.on('load', () => {
        setEstadoMapa('listo');
        mapa.setFog({
          range: [0.5, 10],
          color: '#242b3b',
          'high-color': '#161b24',
          'space-color': '#0b0e14',
          'horizon-blend': 0.5
        });

        const elVehiculo = document.createElement('div');
        elVehiculo.style.cssText = `
          width: 40px; height: 40px; background: #3b82f6; border-radius: 50%;
          border: 4px solid white; box-shadow: 0 0 20px rgba(59, 130, 246, 0.7);
          display: flex; align-items: center; justify-content: center;
        `;
        elVehiculo.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" transform="rotate(-45)">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        `;

        marcadorUsuarioRef.current = new mapboxgl.Marker({ element: elVehiculo, anchor: 'center' })
          .setLngLat(DEFAULT_CENTER)
          .addTo(mapa);
      });

      mapa.on('error', (e) => {
        if (e.error?.message?.includes('Token')) {
          setEstadoMapa('token-invalido');
          setErrorDetalle('Token de Mapbox rechazado por el servidor');
        } else {
          setEstadoMapa('error-gl');
          setErrorDetalle(e.error?.message || 'Error desconocido al cargar el mapa');
        }
      });

      mapa.on('click', (e) => {
        if (estadoNavegacion === 'navegando') return; // No cambiar destino mientras navegas
        setDestino([e.lngLat.lng, e.lngLat.lat]);
        setEstadoNavegacion('cuenta_regresiva');
        setSegundosRestantes(5);
      });

    } catch (err) {
      setEstadoMapa('error-gl');
      setErrorDetalle(err instanceof Error ? err.message : 'Error al inicializar WebGL');
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      marcadorUsuarioRef.current = null;
      marcadorDestinoRef.current = null;
    };
  }, [vistaActiva, estaMontado, estadoNavegacion]);

  useEffect(() => {
    if (estadoNavegacion !== 'cuenta_regresiva') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          iniciarNavegacionReal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [estadoNavegacion]);

  const calcularDistanciaMetros = (p1: [number, number], p2: [number, number]) => {
    const R = 6371e3;
    const dLat = (p2[1] - p1[1]) * Math.PI / 180;
    const dLon = (p2[0] - p1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const calcularCentroCamaraAtras = (lat: number, lon: number, heading: number | null): [number, number] => {
    const headingReal = (heading ?? 0) * Math.PI / 180;
    const offsetMetros = -40; 
    const dLat = (Math.cos(headingReal) * offsetMetros) / 111320;
    const dLon = (Math.sin(headingReal) * offsetMetros) / (111320 * Math.cos((lat * Math.PI) / 180));
    return [lon - dLon, lat - dLat];
  };

  useEffect(() => {
    if (!ubicacion || !mapRef.current || !marcadorUsuarioRef.current) return;

    const nuevaPos: [number, number] = [ubicacion.longitud, ubicacion.latitud];
    let headingActual = ubicacion.heading;

    if (ultimaPosValidaRef.current) {
      const metrosMovidos = calcularDistanciaMetros(ultimaPosValidaRef.current, nuevaPos);
      
      if (metrosMovidos < 5) {
        marcadorUsuarioRef.current.setLngLat(ultimaPosValidaRef.current);
        return; 
      }

      if (ultimoHeadingValidoRef.current !== null && headingActual !== null) {
        let diff = Math.abs(headingActual - ultimoHeadingValidoRef.current);
        if (diff > 180) diff = 360 - diff;
        if (diff > 90 && metrosMovidos < 20) {
          headingActual = ultimoHeadingValidoRef.current;
        }
      }
    }

    ultimaPosValidaRef.current = nuevaPos;
    if (headingActual !== null) ultimoHeadingValidoRef.current = headingActual;
    marcadorUsuarioRef.current.setLngLat(nuevaPos);

    if (estadoNavegacion === 'navegando' && distanciaAcumuladaPasosRef.current.length > 0) {
      if (prevLocationRef.current) {
        const metrosNuevos = calcularDistanciaMetros(prevLocationRef.current, nuevaPos);
        distanciaRecorridaRef.current += metrosNuevos;
      }
      prevLocationRef.current = nuevaPos;

      let nuevoIdx = 0;
      for (let i = 0; i < distanciaAcumuladaPasosRef.current.length; i++) {
        if (distanciaRecorridaRef.current >= distanciaAcumuladaPasosRef.current[i]) nuevoIdx = i;
      }
      setPasoActualIdx(prev => prev !== nuevoIdx ? nuevoIdx : prev);
    }

    if (!mapaDescentrado) {
      if (estadoNavegacion === 'navegando') {
        // VISTA 3D TRASERA CON ZOOM CERCANO
        const centroCamara = calcularCentroCamaraAtras(nuevaPos[1], nuevaPos[0], headingActual);
        mapRef.current.easeTo({
          center: centroCamara,
          bearing: headingActual ?? 0,
          pitch: 70,
          zoom: 17, // MAS CERCANO
          duration: 1000
        });
      } else {
        // VISTA PLANA NORMAL
        mapRef.current.easeTo({
          center: nuevaPos,
          bearing: headingActual ?? 0,
          pitch: 0, // PLANO
          zoom: 16,
          duration: 1000
        });
      }
    }
  }, [ubicacion, estadoNavegacion, mapaDescentrado]);

  const hablarIndicacion = useCallback((texto: string) => {
    if (estaMutado || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const enunciar = new SpeechSynthesisUtterance(texto);
    enunciar.lang = 'es-CL';
    enunciar.rate = 1.0;
    window.speechSynthesis.speak(enunciar);
  }, [estaMutado]);

  useEffect(() => {
    if (indicaciones.length > 0 && estadoNavegacion === 'navegando' && indicaciones[pasoActualIdx]) {
      hablarIndicacion(indicaciones[pasoActualIdx].texto);
    }
  }, [pasoActualIdx, indicaciones, estadoNavegacion, hablarIndicacion]);

  useEffect(() => {
    if (!destino || !mapRef.current) return;

    if (!marcadorDestinoRef.current) {
      const elDestino = document.createElement('div');
      elDestino.style.cssText = `
        width: 32px; height: 32px; background: #ef4444; border-radius: 50%;
        border: 3px solid white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
        display: flex; align-items: center; justify-content: center;
      `;
      elDestino.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
      `;

      marcadorDestinoRef.current = new mapboxgl.Marker({ element: elDestino, anchor: 'center' })
        .setLngLat(destino)
        .addTo(mapRef.current);
    } else {
      marcadorDestinoRef.current.setLngLat(destino);
    }
  }, [destino]);

  const iniciarNavegacionReal = () => {
    setEstadoNavegacion('navegando');
    setMapaDescentrado(false);
    
    if (ubicacion && destino) {
      trazarRutaLogistica([ubicacion.longitud, ubicacion.latitud], destino);
      
      // TRANSICION: De plano a 3D acercado
      const centroCamara = calcularCentroCamaraAtras(ubicacion.latitud, ubicacion.longitud, ubicacion.heading);
      mapRef.current?.flyTo({
        center: centroCamara,
        bearing: ubicacion.heading ?? 0,
        pitch: 70, // INCLINAR
        zoom: 17,  // ACERCAR
        duration: 1500 // TRANSICION GRADUAL MAS LENTA PARA EL EFECTO
      });
    }
  };

  const trazarRutaLogistica = async (origen: [number, number], fin: [number, number]) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapRef.current) return;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origen[0]},${origen[1]};${fin[0]},${fin[1]}?steps=true&geometries=geojson&overview=full&language=es&access_token=${token}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.routes?.length) return;

      const ruta = data.routes[0];
      setDistanciaEstimada(`${(ruta.distance / 1000).toFixed(1)} km - ${Math.round(ruta.duration / 60)} min`);

      const pasos = ruta.legs[0].steps;
      const pasosFormateados: IndicacionPaso[] = pasos.map((step: any) => ({
        texto: step.maneuver.instruction,
        distancia: `${Math.round(step.distance)} m`,
        tipo: step.maneuver.type
      }));
      setIndicaciones(pasosFormateados);
      setPanelMinimizado(false);

      let acum = 0;
      const distAcum = pasos.map((step: any) => { acum += step.distance; return acum; });
      distanciaAcumuladaPasosRef.current = distAcum;
      distanciaRecorridaRef.current = 0;
      prevLocationRef.current = null;
      setPasoActualIdx(0);

      const mapa = mapRef.current;

      if (mapa.getSource('ruta')) {
        (mapa.getSource('ruta') as mapboxgl.GeoJSONSource).setData({ type: 'Feature', properties: {}, geometry: ruta.geometry });
      } else {
        mapa.addSource('ruta', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: ruta.geometry } });
        mapa.addLayer({
          id: 'capaRuta', type: 'line', source: 'ruta',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#38bdf8', 'line-width': 6, 'line-opacity': 0.9 }
        });
      }
    } catch (err) {
      console.error('Error obteniendo ruta:', err);
    }
  };

  const centrarCamara = () => {
    if (!ubicacion || !mapRef.current) return;
    
    if (estadoNavegacion === 'navegando') {
      const centroCamara = calcularCentroCamaraAtras(ubicacion.latitud, ubicacion.longitud, ubicacion.heading);
      mapRef.current.easeTo({
        center: centroCamara,
        bearing: ubicacion.heading ?? 0,
        pitch: 70,
        zoom: 17,
        duration: 800
      });
    } else {
      mapRef.current.easeTo({
        center: [ubicacion.longitud, ubicacion.latitud],
        bearing: ubicacion.heading ?? 0,
        pitch: 0,
        zoom: 16,
        duration: 800
      });
    }
    setMapaDescentrado(false);
  };

  const cancelarViaje = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    
    if (marcadorDestinoRef.current) {
      marcadorDestinoRef.current.remove();
      marcadorDestinoRef.current = null;
    }

    const mapa = mapRef.current;
    if (mapa) {
      if (mapa.getLayer('capaRuta')) mapa.removeLayer('capaRuta');
      if (mapa.getSource('ruta')) mapa.removeSource('ruta');
    }

    setDestino(null);
    setDistanciaEstimada(null);
    setIndicaciones([]);
    setPasoActualIdx(0);
    setEstadoNavegacion('libre');
    distanciaRecorridaRef.current = 0;
    prevLocationRef.current = null;
    distanciaAcumuladaPasosRef.current = [];
    
    // VOLVER A PLANO AL CANCELAR
    mapRef.current?.easeTo({ pitch: 0, zoom: 16, duration: 1000 });
  };

  const cerrarMapa = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      marcadorUsuarioRef.current = null;
      marcadorDestinoRef.current = null;
    }
    setDestino(null);
    setDistanciaEstimada(null);
    setIndicaciones([]);
    setPasoActualIdx(0);
    setErrorDetalle(null);
    setEstadoMapa('cargando');
    setEstaMontado(false);
    setMapaDescentrado(false);
    setPanelMinimizado(false);
    setEstadoNavegacion('libre');
    prevLocationRef.current = null;
    ultimaPosValidaRef.current = null;
    ultimoHeadingValidoRef.current = null;
    distanciaRecorridaRef.current = 0;
    distanciaAcumuladaPasosRef.current = [];
    setVistaActiva('panel');
  }, []);

  if (vistaActiva === 'panel') {
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center min-h-[400px] bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Navegacion Logistica</h2>
          <p className="text-neutral-400 text-sm mb-6">Accede al modulo de seguimiento 3D con rastreo GPS e indicaciones por voz.</p>
          {errorGps && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-left">
              <p className="text-red-400 text-xs">Alerta GPS: {errorGps}</p>
            </div>
          )}
          <button onClick={() => setVistaActiva('mapa')} className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-3 px-6 rounded-lg shadow-lg">
            Iniciar Navegacion
          </button>
        </div>
      </div>
    );
  }

  if (vistaActiva === 'mapa' && estadoMapa === 'token-invalido') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center p-8 z-50">
        <div className="bg-red-950/50 border border-red-500/30 rounded-2xl p-8 max-w-lg text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Token de Mapbox Invalido</h2>
          <p className="text-red-300 text-sm mb-6">{errorDetalle}</p>
          <button onClick={cerrarMapa} className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">Volver</button>
        </div>
      </div>
    );
  }

  if (vistaActiva === 'mapa' && estadoMapa === 'error-gl') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center p-8 z-50">
        <div className="bg-yellow-950/50 border border-yellow-500/30 rounded-2xl p-8 max-w-lg text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Error al Cargar Mapa</h2>
          <p className="text-yellow-300 text-sm mb-4">{errorDetalle}</p>
          <button onClick={cerrarMapa} className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-neutral-900 z-50 flex flex-col">
      {estadoNavegacion === 'navegando' && indicaciones.length > 0 && (
        <div className="w-full bg-neutral-900/95 backdrop-blur-md text-white p-4 shadow-xl border-b border-neutral-800 flex items-center justify-between z-[60]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-md animate-pulse shrink-0">
              <FaLocationArrow className="text-xl text-white transform -rotate-45" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Siguiente Maniobra ({indicaciones[pasoActualIdx]?.distancia || '0m'})
              </span>
              <p className="text-sm md:text-base font-semibold text-neutral-100 truncate">
                {indicaciones[pasoActualIdx]?.texto || "Calculando ruta..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-bold text-blue-400">{distanciaEstimada}</p>
            </div>
            <button onClick={() => setEstaMutado(!estaMutado)} className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-300">
              {estaMutado ? <FaVolumeMute className="text-lg text-red-400" /> : <FaVolumeUp className="text-lg text-green-400" />}
            </button>
            <button onClick={cancelarViaje} className="p-3 rounded-full bg-neutral-800 hover:bg-red-600 transition-colors text-neutral-300 hover:text-white">
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {estadoMapa === 'cargando' && (
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center z-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
              <p className="text-neutral-400 text-sm">Cargando mapa...</p>
            </div>
          </div>
        )}

        {indicaciones.length === 0 && (
          <div className="absolute top-4 left-4 z-50 w-[320px] sm:w-[360px]">
            <div className="bg-neutral-800/95 backdrop-blur-md p-4 rounded-xl border border-neutral-700 shadow-2xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${estadoMapa === 'listo' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <h2 className="text-sm font-semibold text-neutral-300 tracking-wide uppercase">Navegacion en Vivo</h2>
              </div>
              {errorGps && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 mb-3">
                  <p className="text-red-400 text-xs">{errorGps}</p>
                </div>
              )}
              {!ubicacion ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent shrink-0" />
                  <p className="text-xs text-neutral-400">Esperando senal GPS...</p>
                </div>
              ) : (
                <p className="text-neutral-500 text-xs italic">Selecciona destino en el mapa</p>
              )}
            </div>
          </div>
        )}

        {estadoNavegacion === 'navegando' && indicaciones.length > 0 && (
          <div className={`absolute top-4 right-4 z-50 bg-neutral-800/95 backdrop-blur-md rounded-xl border border-neutral-700 shadow-2xl text-white flex flex-col transition-all duration-300 overflow-hidden ${
            panelMinimizado ? 'w-10 h-10' : 'w-[280px] max-h-[60vh]'
          }`}>
            <button 
              onClick={() => setPanelMinimizado(!panelMinimizado)} 
              className="w-full h-10 flex items-center justify-center bg-neutral-700/50 hover:bg-neutral-700 transition-colors shrink-0"
            >
              {panelMinimizado ? <FiChevronUp className="text-lg" /> : <FiChevronDown className="text-lg" />}
            </button>
            
            {!panelMinimizado && (
              <>
                <div className="p-3 border-b border-neutral-700 sm:block hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Hoja de Ruta - {distanciaEstimada}</span>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                  {indicaciones.map((paso, idx) => (
                    <div key={idx} className={`text-[11px] p-2 rounded flex justify-between items-start gap-2 transition-colors ${
                      idx === pasoActualIdx ? 'bg-blue-500/20 text-blue-400 font-bold border-l-2 border-blue-500' : 'text-neutral-400 border-l-2 border-transparent'
                    }`}>
                      <span className="leading-tight">{paso.texto}</span>
                      <span className="text-[10px] opacity-60 font-mono shrink-0">{paso.distancia}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {estadoNavegacion === 'cuenta_regresiva' && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
            <button 
              onClick={iniciarNavegacionReal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl text-lg transition-all animate-pulse"
            >
              Ir? ({segundosRestantes})
            </button>
            <button 
              onClick={cancelarViaje}
              className="bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold py-2 px-4 rounded-lg transition-colors border border-neutral-600"
            >
              Cancelar
            </button>
          </div>
        )}

        {mapaDescentrado && estadoNavegacion !== 'cuenta_regresiva' && (
          <button 
            onClick={centrarCamara}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-800/95 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl border border-neutral-700 transition-all"
            title="Centrar en mi ubicacion"
          >
            <FiCrosshair className="text-2xl" />
          </button>
        )}

        <button onClick={cerrarMapa} className="absolute bottom-6 right-6 z-50 bg-neutral-800/95 hover:bg-neutral-700 text-white font-semibold py-3 px-5 rounded-lg shadow-xl border border-neutral-700 transition-colors">
          Cerrar Mapa
        </button>
      </div>
    </div>
  );
}