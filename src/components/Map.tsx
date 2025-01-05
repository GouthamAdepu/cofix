import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Issue } from '../types';

function SetViewOnLocation({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords]);
  return null;
}

interface MapProps {
  issues: Issue[];
}

export default function IssueMap({ issues }: MapProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([17.455598622434977, 78.66648576707394]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return (
    <MapContainer
      center={currentLocation}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <SetViewOnLocation coords={currentLocation} />
      
      {/* Current location circle */}
      <CircleMarker 
        center={currentLocation}
        radius={20}
        pathOptions={{
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.3
        }}
      />

      {/* Issue markers */}
      {issues.map((issue) => (
        issue.location && (
          <Marker
            key={issue.id}
            position={[issue.location.lat, issue.location.lng]}
          />
        )
      ))}
    </MapContainer>
  );
}