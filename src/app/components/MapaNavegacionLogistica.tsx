'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUbicacionTiempoReal } from '../[lang]/hook/useUbicacionTiempoReal';

const DEFAULT_CENTER: [number, number] = [-73.0498, -36.8270];

type EstadoMapa = 'cargando' | 'token-invalido' | 'error-gl' | 'listo';

export default function MapaNavegacionLogistica() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const marcadorUsuarioRef = useRef<mapboxgl.Marker | null>(null);
  const marcadorDestinoRef = useRef<mapboxgl.Marker | null>(null);
  
  const { ubicacion, error: errorGps } = useUbicacionTiempoReal();
  const [destino, setDestino] = useState<[number, number] | null>(null);
  const [distanciaEstimada, setDistanciaEstimada] = useState<string | null>(null);
  
  const [vistaActiva, setVistaActiva] = useState<'panel' | 'mapa'>('panel');
  const [estadoMapa, setEstadoMapa] = useState<EstadoMapa>('cargando');
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [estaMontado, setEstaMontado] = useState(false);

  // Forzar montaje del DOM interno antes de inicializar
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

  // Inicializar mapa
  useEffect(() => {
    if (vistaActiva !== 'mapa') return;
    if (!estaMontado) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Check 1: Token existe
    if (!token) {
      setEstadoMapa('token-invalido');
      setErrorDetalle('NEXT_PUBLIC_MAPBOX_TOKEN no esta definido en .env.local');
      console.error('CRITICO: NEXT_PUBLIC_MAPBOX_TOKEN no esta definido');
      return;
    }

    // Check 2: Formato valido
    if (!token.startsWith('pk.')) {
      setEstadoMapa('token-invalido');
      setErrorDetalle(`Token invalido. Debe empezar con "pk." - Actual: ${token.substring(0, 10)}...`);
      return;
    }

    // Check 3: Dimensiones del contenedor
    const rect = mapContainerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.error('Contenedor 0x0. Reintentando...');
      setEstaMontado(false);
      setTimeout(() => setEstaMontado(true), 150);
      return;
    }

    console.log('Inicializando mapa...', { 
      width: rect.width, 
      height: rect.height,
      token: token.substring(0, 15) + '...' 
    });

    mapboxgl.accessToken = token;

    try {
      const mapa = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: DEFAULT_CENTER,
        zoom: 14,
        pitch: 45,
        bearing: 0,
        antialias: true
      });

      mapRef.current = mapa;

      mapa.on('load', () => {
        console.log('Mapa cargado exitosamente');
        setEstadoMapa('listo');

        // Configuracion de atmosfera 3D
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

        marcadorUsuarioRef.current = new mapboxgl.Marker({
          element: elVehiculo,
          anchor: 'center'
        })
          .setLngLat(DEFAULT_CENTER)
          .addTo(mapa);
      });

      mapa.on('error', (e) => {
        console.error('Error del mapa:', e);
        if (e.error?.message?.includes('Token')) {
          setEstadoMapa('token-invalido');
          setErrorDetalle('Token de Mapbox rechazado por el servidor');
        } else {
          setEstadoMapa('error-gl');
          setErrorDetalle(e.error?.message || 'Error desconocido al cargar el mapa');
        }
      });

      mapa.on('click', (e) => {
        setDestino([e.lngLat.lng, e.lngLat.lat]);
      });

    } catch (err) {
      console.error('Error al crear el mapa:', err);
      setEstadoMapa('error-gl');
      setErrorDetalle(err instanceof Error ? err.message : 'Error al inicializar WebGL');
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      marcadorUsuarioRef.current = null;
      marcadorDestinoRef.current = null;
    };
  }, [vistaActiva, estaMontado]);

  // Actualizar posicion GPS
  useEffect(() => {
    if (!ubicacion || !mapRef.current || !marcadorUsuarioRef.current) return;

    const nuevaPos: [number, number] = [ubicacion.longitud, ubicacion.latitud];
    marcadorUsuarioRef.current.setLngLat(nuevaPos);

    if (!destino) {
      mapRef.current.easeTo({
        center: nuevaPos,
        bearing: ubicacion.heading ?? 0,
        pitch: 60,
        duration: 1000
      });
    } else {
      trazarRutaLogistica(nuevaPos, destino);
    }
  }, [ubicacion, destino]);

  // Manejar destino
  const manejarDestino = useCallback(() => {
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

      marcadorDestinoRef.current = new mapboxgl.Marker({
        element: elDestino,
        anchor: 'center'
      })
        .setLngLat(destino)
        .addTo(mapRef.current);
    } else {
      marcadorDestinoRef.current.setLngLat(destino);
    }

    if (ubicacion) {
      trazarRutaLogistica([ubicacion.longitud, ubicacion.latitud], destino);
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([ubicacion.longitud, ubicacion.latitud]);
      bounds.extend(destino);
      mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 });
    }
  }, [destino, ubicacion]);

  useEffect(() => {
    manejarDestino();
  }, [manejarDestino]);

  // Trazar ruta
  const trazarRutaLogistica = async (origen: [number, number], fin: [number, number]) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapRef.current) return;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origen[0]},${origen[1]};${fin[0]},${fin[1]}?steps=true&geometries=geojson&access_token=${token}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data.routes?.length) return;

      const ruta = data.routes[0];
      setDistanciaEstimada(`${(ruta.distance / 1000).toFixed(1)} km - ${Math.round(ruta.duration / 60)} min`);

      const mapa = mapRef.current;

      if (mapa.getSource('ruta')) {
        (mapa.getSource('ruta') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: ruta.geometry
        });
      } else {
        mapa.addSource('ruta', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: ruta.geometry }
        });

        mapa.addLayer({
          id: 'capaRuta',
          type: 'line',
          source: 'ruta',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#38bdf8', 'line-width': 6, 'line-opacity': 0.9 }
        });
      }
    } catch (err) {
      console.error('Error obteniendo ruta:', err);
    }
  };

  // Destruir mapa al volver al panel
  const cerrarMapa = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      marcadorUsuarioRef.current = null;
      marcadorDestinoRef.current = null;
    }
    setDestino(null);
    setDistanciaEstimada(null);
    setErrorDetalle(null);
    setEstadoMapa('cargando');
    setEstaMontado(false);
    setVistaActiva('panel');
  }, []);

  // ==========================================
  // VISTA 1: PANEL PRINCIPAL
  // ==========================================
  if (vistaActiva === 'panel') {
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center min-h-[400px] bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Navegacion Logistica</h2>
          <p className="text-neutral-400 text-sm mb-6">
            Accede al modulo de seguimiento en tiempo real con rastreo GPS y trazado de rutas optimizadas.
          </p>

          {errorGps && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-left">
              <p className="text-red-400 text-xs">Alerta GPS: {errorGps}</p>
            </div>
          )}

          <button
            onClick={() => setVistaActiva('mapa')}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
          >
            Iniciar Navegacion
          </button>
          
          <p className="text-neutral-600 text-xs mt-4">
            Se requerira acceso a tu ubicacion precisa.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 2: PANTALLA COMPLETA - ERROR TOKEN
  // ==========================================
  if (vistaActiva === 'mapa' && estadoMapa === 'token-invalido') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center p-8 z-50">
        <div className="bg-red-950/50 border border-red-500/30 rounded-2xl p-8 max-w-lg text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Token de Mapbox Invalido</h2>
          <p className="text-red-300 text-sm mb-6">{errorDetalle}</p>
          <div className="bg-black/40 rounded-lg p-4 text-left mb-6">
            <p className="text-neutral-400 text-xs font-mono mb-2"># Solucion: Agrega a tu archivo .env.local</p>
            <code className="text-green-400 text-sm block bg-black/50 p-3 rounded">
              NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...
            </code>
            <p className="text-neutral-500 text-xs mt-3">
              Obten tu token gratis en: mapbox.com/account/access-tokens
            </p>
          </div>
          <button 
            onClick={cerrarMapa}
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 3: PANTALLA COMPLETA - ERROR WEBGL
  // ==========================================
  if (vistaActiva === 'mapa' && estadoMapa === 'error-gl') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center p-8 z-50">
        <div className="bg-yellow-950/50 border border-yellow-500/30 rounded-2xl p-8 max-w-lg text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Error al Cargar Mapa</h2>
          <p className="text-yellow-300 text-sm mb-4">{errorDetalle}</p>
          <p className="text-neutral-400 text-xs mb-6">
            Posibles causas: WebGL no soportado, conexion a internet, o el navegador bloqueo el contenido.
          </p>
          <button 
            onClick={cerrarMapa}
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 4: PANTALLA COMPLETA - MAPA ACTIVO
  // ==========================================
  return (
    <div className="fixed inset-0 w-full h-full bg-neutral-900 z-50">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Spinner de carga */}
      {estadoMapa === 'cargando' && (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Panel de informacion flotante */}
      <div className="absolute top-4 left-4 z-50 w-[320px] sm:w-[360px]">
        <div className="bg-neutral-800/95 backdrop-blur-md p-4 rounded-xl border border-neutral-700 shadow-2xl text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2.5 h-2.5 rounded-full ${
              estadoMapa === 'listo' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`} />
            <h2 className="text-sm font-semibold text-neutral-300 tracking-wide uppercase">
              Navegacion en Vivo
            </h2>
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
            <div className="space-y-2">
              <div className="bg-black/30 rounded-lg p-2.5">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Ubicacion GPS</p>
                <p className="text-xs font-mono text-neutral-200">
                  {ubicacion.latitud.toFixed(5)}, {ubicacion.longitud.toFixed(5)}
                </p>
              </div>

              {distanciaEstimada ? (
                <div className="bg-blue-500/15 border border-blue-500/25 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-blue-400">{distanciaEstimada}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
                    Ruta optimizada
                  </p>
                </div>
              ) : (
                <p className="text-neutral-500 text-xs italic">
                  Selecciona destino en el mapa
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Boton cerrar mapa */}
      <button
        onClick={cerrarMapa}
        className="absolute bottom-6 right-6 z-50 bg-neutral-800/95 hover:bg-neutral-700 text-white font-semibold py-3 px-5 rounded-lg shadow-xl border border-neutral-700 transition-colors"
      >
        Cerrar Mapa
      </button>

      {/* Badge de estado debug */}
      <div className="absolute bottom-6 left-6 z-50">
        <div className={`px-3 py-1.5 rounded-full text-[10px] font-mono border ${
          estadoMapa === 'listo' 
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}>
          Mapa: {estadoMapa}
        </div>
      </div>
    </div>
  );
}