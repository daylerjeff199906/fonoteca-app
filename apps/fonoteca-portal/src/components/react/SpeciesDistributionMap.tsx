import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface SpeciesDistributionMapProps {
  scientificName: string;
  latitude?: number;
  longitude?: number;
}

export const SpeciesDistributionMap: React.FC<SpeciesDistributionMapProps> = ({ scientificName, latitude, longitude }) => {
  const [usageKey, setUsageKey] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-xl animate-pulse">
          <p className="text-gray-500 font-medium">Cargando mapa de distribución...</p>
        </div>
      </div>
    );
  }

  if (!usageKey) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-full h-[500px] flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600 font-medium">No se encontró información de distribución para {scientificName}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
        <MapContainer 
          center={latitude && longitude ? [latitude, longitude] : [-9.19, -75.01]} 
          zoom={latitude && longitude ? 8 : 5} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* Base TileLayer: CartoDB Dark Matter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* GBIF Density TileLayer (Hexagons) */}
          <TileLayer
            attribution='&copy; <a href="https://www.gbif.org/">GBIF</a>'
            url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?taxonKey=${usageKey}&bin=hex&hexPerTile=50&style=classic.poly&srs=EPSG:3857`}
          />

          {/* Individual occurrence marker */}
          {latitude && longitude && (
            <Marker position={[latitude, longitude]}>
              <Popup>
                <div className="text-xs">
                  <strong>{scientificName}</strong><br />
                  Ubicación del registro
                </div>
              </Popup>
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
