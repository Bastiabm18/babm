'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Arreglo para el ícono del marcador
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

interface MapProps {
  position: [number, number];
}

export default function Map({ position }: MapProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Este efecto detecta si el tema oscuro está activado en tu app
  // observando la clase 'dark' en la etiqueta <html>.
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Comprueba el tema al montar el componente
    checkTheme();

    // Observa cambios en la clase del elemento html para actualizar el mapa en tiempo real
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect(); // Limpia el observador al desmontar
  }, []);

  // --- Configuración de Mapbox ---
  const accessToken = 'pk.eyJ1IjoiYXZlZ2FwNDEiLCJhIjoiY2tibWtpdGttMGl1NjJybjhjNTVxaGtpcyJ9.dLbDgSiWkdlq8SyzhREO7A';
  const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
  
  // Elige dinámicamente el estilo del mapa según el tema
  const mapStyleId = isDarkMode ? 'mapbox/navigation-night-v1' : 'mapbox/navigation-day-v1';
  const tileUrl = `https://api.mapbox.com/styles/v1/${mapStyleId}/tiles/{z}/{x}/{y}?access_token=${accessToken}`;
  // ------------------------------

  return (
    <MapContainer
      center={position}
      zoom={11}
      scrollWheelZoom={false}
      className="w-full h-full rounded-lg"
    >
      <TileLayer
        // Añadimos una 'key' para que React recargue la capa al cambiar de tema
        key={mapStyleId}
        attribution={mapboxAttribution}
        url={tileUrl}
        tileSize={512}
        zoomOffset={-1}
      />
      <Marker position={position}>
        <Popup>
          Aquí estamos. ¡Te esperamos!
        </Popup>
      </Marker>
    </MapContainer>
  );
}