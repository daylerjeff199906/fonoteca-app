import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map view changes dynamically
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
};

interface SpeciesDistributionMapProps {
  scientificName: string;
  latitude?: number;
  longitude?: number;
}

export const SpeciesDistributionMap: React.FC<SpeciesDistributionMapProps> = ({ scientificName, latitude, longitude }) => {
  const [usageKey, setUsageKey] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Custom icon for the occurrence to make it stand out
  const occurrenceIcon = L.divIcon({
    className: 'custom-occurrence-icon',
    html: `<div style="
      background-color: #ff3333; 
      width: 16px; 
      height: 16px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(255, 51, 51, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0); }
      }
    </style>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  useEffect(() => {
    const fetchUsageKey = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`);
        const data = await response.json();
        
        if (data.usageKey) {
          setUsageKey(data.usageKey);
        } else {
          setUsageKey(null);
        }
      } catch (error) {
        console.error("Error fetching GBIF usageKey:", error);
        setUsageKey(null);
      } finally {
        setLoading(false);
      }
    };

    if (scientificName) {
      fetchUsageKey();
    } else {
      setLoading(false);
      setUsageKey(null);
    }
  }, [scientificName]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse">
          <p className="text-gray-500 font-medium">Cargando mapa de distribución...</p>
        </div>
      </div>
    );
  }

  // Only show error if BOTH distribution data and occurrence coordinates are missing
  if (!usageKey && (!latitude || !longitude)) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-full h-[500px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontró información de distribución para {scientificName}.</p>
        </div>
      </div>
    );
  }

  const mapCenter: [number, number] = latitude && longitude ? [latitude, longitude] : [-9.19, -75.01];
  const mapZoom = latitude && longitude ? 8 : 5;

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          zoomControl={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
        >
          {/* Component to update view when coordinates change */}
          <ChangeView center={mapCenter} zoom={mapZoom} />

          {/* Base TileLayer: CartoDB Dark Matter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* GBIF Density TileLayer (Hexagons) - Only if usageKey exists */}
          {usageKey && (
            <TileLayer
              attribution='&copy; <a href="https://www.gbif.org/">GBIF</a>'
              url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?taxonKey=${usageKey}&bin=hex&hexPerTile=50&style=classic.poly&srs=EPSG:3857`}
            />
          )}

          {/* Individual occurrence marker with pulsing effect and permanent label */}
          {latitude && longitude && (
            <Marker position={[latitude, longitude]} icon={occurrenceIcon}>
              <Tooltip permanent direction="top" offset={[0, -10]} className="custom-map-tooltip">
                <div className="px-2 py-1 font-bold text-[10px] uppercase tracking-wider">
                  Ubicación del Registro
                </div>
              </Tooltip>
            </Marker>
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 italic px-2">
        Datos de distribución espacial proporcionados por la Global Biodiversity Information Facility (GBIF)
      </p>
    </div>
  );
};
