"use client"

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
})

interface MapPickerProps {
  lat?: number | null
  lng?: number | null
  onChange: (lat: number, lng: number) => void
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return lat && lng ? (
    <Marker position={[lat, lng]} />
  ) : null
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const center: [number, number] = lat && lng ? [lat, lng] : [-3.749, -73.25] // Iquitos default

  return (
    <div className="h-[300px] w-full border rounded-lg overflow-hidden relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded text-[10px] z-[400] border shadow-sm">
        Haz clic en el mapa para fijar coordenadas
      </div>
    </div>
  )
}
