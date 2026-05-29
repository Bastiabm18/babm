'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import { FaRoute, FaTrash, FaMousePointer } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Parche nativo de Leaflet para marcadores en entornos Next.js
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

interface RutaFlota {
  id: string;
  label: string;
  destino: string;
  waypoints: string;
  waypointsConfig: string;
}

interface MarcadorCustom {
  lat: number;
  lng: number;
}

function CambiarEncuadreMapa({ coordenadas }: { coordenadas: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordenadas && coordenadas.length > 0) {
      const limites = L.latLngBounds(coordenadas);
      map.fitBounds(limites, { padding: [40, 40] });
    }
  }, [coordenadas, map]);
  return null;
}

export default function MapaBuscarRuta() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rutaActiva, setRutaActiva] = useState<RutaFlota | null>(null);
  const [coordenadasPoliline, setCoordenadasPoliline] = useState<[number, number][]>([]);
  
  // Estado para capturar los clics del usuario en el lienzo
  const [puntosCreados, setPuntosCreados] = useState<MarcadorCustom[]>([]);
  const [modoCreacion, setModoCreacion] = useState(false);

  useEffect(() => {
    const evaluarTema = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    evaluarTema();
    const observador = new MutationObserver(evaluarTema);
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observador.disconnect();
  }, []);

  const listadoRutas: RutaFlota[] = [
    {
      id: 'madera-angol-temuco',
      label: 'Ruta de la Madera',
      destino: 'Temuco por Angol',
      waypoints: '-73.0503,-36.8261;-72.9415,-37.1810;-72.6782,-37.5023;-72.7107,-37.7981;-72.5901,-38.7396',
      waypointsConfig: '0;4'
    },
    {
      id: 'troncal-valdivia',
      label: 'Ruta Costera Sur',
      destino: 'Valdivia por Los Ángeles',
      waypoints: '-73.0503,-36.8261;-72.3517,-37.4697;-73.2452,-39.8142',
      waypointsConfig: '0;2'
    },
    {
      id: 'troncal-chiloe',
      label: 'Ruta Continente - Isla',
      destino: 'Castro (Chiloé)',
      waypoints: '-73.0503,-36.8261;-73.1251,-40.5739;-72.9469,-41.4717;-73.7644,-42.4721',
      waypointsConfig: '0;3'
    }
  ];

  // Componente escucha que inyecta coordenadas al hacer clic
  function EscuchadorClicksMapa() {
    useMapEvents({
      click(e) {
        if (!modoCreacion) return;
        
        const nuevoPunto: MarcadorCustom = { lat: e.latlng.lat, lng: e.latlng.lng };
        const laLista = [...puntosCreados, nuevoPunto];
        setPuntosCreados(laLista);

        if (laLista.length >= 2) {
          const waypointsUrl = laLista.map(p => `${p.lng},${p.lat}`).join(';');
          setRutaActiva({
            id: 'ruta-interactiva-click',
            label: 'Modo Dibujo',
            destino: `${laLista.length} Puntos Marcados`,
            waypoints: waypointsUrl,
            waypointsConfig: `0;${laLista.length - 1}`
          });
        }
      },
    });
    return null;
  }

  const resetearMapaEInteraccion = () => {
    setPuntosCreados([]);
    setRutaActiva(null);
    setCoordenadasPoliline([]);
    setModoCreacion(false);
  };

  useEffect(() => {
    if (!rutaActiva) {
      setCoordenadasPoliline([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    if (!token) return;

    const endpoint = `https://api.mapbox.com/directions/v5/mapbox/driving/${rutaActiva.waypoints}?geometries=geojson&waypoints=${rutaActiva.waypointsConfig}&overview=full&access_token=${token}`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes || data.routes.length === 0) return;
        const geojsonCoords = data.routes[0].geometry.coordinates;
        const coordenadasValidas = geojsonCoords.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        setCoordenadasPoliline(coordenadasValidas);
      })
      .catch((error) => console.error("Error Mapbox Directions:", error));
  }, [rutaActiva]);

  const mapStyleId = isDarkMode ? 'mapbox/navigation-night-v1' : 'mapbox/navigation-day-v1';
  const tileUrl = `https://api.mapbox.com/styles/v1/${mapStyleId}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}`;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Contenedor del Mapa */}
      <div className="w-full h-96 md:h-[450px] rounded-lg shadow-lg overflow-hidden border border-border-light dark:border-border-dark">
        <MapContainer center={[-36.8271, -73.0503]} zoom={7} scrollWheelZoom={true} className="w-full h-full z-10" >
          <TileLayer key={mapStyleId} url={tileUrl} tileSize={512} zoomOffset={-1} />
          
          <EscuchadorClicksMapa />

          {puntosCreados.map((punto, index) => (
            <Marker key={index} position={[punto.lat, punto.lng]}>
              <Popup>
                <div className="text-xs font-bold">
                  {index === 0 ? ' Origen' : index === puntosCreados.length - 1 ? '🏁 Destino' : `Parada ${index}`}
                </div>
              </Popup>
            </Marker>
          ))}

          {coordenadasPoliline.length > 0 && (
            <>
              <Polyline positions={coordenadasPoliline} pathOptions={{ color: '#ff5722', weight: 6, opacity: 0.85 }} />
              <CambiarEncuadreMapa coordenadas={coordenadasPoliline} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Contenedor de Controles con tus clases exactas */}
      <div className="bg-background-light_alt dark:bg-background-dark_alt p-4 rounded-lg shadow-md w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
            <FaRoute className="text-sm" /> Control e Inyección de Rutas en Tiempo Real
          </h4>
          {modoCreacion && (
            <span className="text-[11px] font-semibold animate-pulse">
               Haz clic sobre el mapa para ir inyectando localidades
            </span>
          )}
        </div>
        
        {/* Contenedor de 5 slots para que quepan todos los botones en tu fila */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {listadoRutas.map((ruta) => {
            const esActiva = rutaActiva?.id === ruta.id;
            return (
              <motion.button
                key={ruta.id}
                onClick={() => { setPuntosCreados([]); setModoCreacion(false); setRutaActiva(ruta); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 text-xs font-semibold py-3 px-4 rounded-lg border transition-all duration-200 text-left sm:text-center ${
                  esActiva
                    ? 'bg-primary-light dark:bg-primary-dark text-white border-transparent shadow-md'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                }`}
              >
                <span className="block font-bold text-[10px] uppercase mb-0.5 opacity-60">
                  {ruta.label}
                </span>
                {ruta.destino}
              </motion.button>
            );
          })}

          {/* Cuarto Botón: Trazado dinámico por clics */}
          <motion.button
            onClick={() => { setRutaActiva(null); setCoordenadasPoliline([]); setModoCreacion(true); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 text-xs font-bold py-3 px-4 rounded-lg border flex flex-col items-center justify-center transition-all duration-200 ${
              modoCreacion
                ? 'bg-primary-light dark:bg-primary-dark text-white border-transparent shadow-md'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
            }`}
          >
            <span className="flex items-center gap-1 uppercase text-[10px] tracking-wider mb-0.5">
              <FaMousePointer /> {modoCreacion ? 'Marcado Activo' : 'Trazado Libre'}
            </span>
            <span>{puntosCreados.length > 0 ? `${puntosCreados.length} Nodos` : 'Marcar en Mapa'}</span>
          </motion.button>

          {/* Quinto Botón: Reset */}
          <motion.button
            onClick={resetearMapaEInteraccion}
            disabled={puntosCreados.length === 0 && !rutaActiva}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-xs font-bold py-3 px-4 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaTrash /> Limpiar
          </motion.button>
        </div>
      </div>
    </div>
  );
}