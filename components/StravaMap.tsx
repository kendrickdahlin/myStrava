"use client";

import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type StravaMapProps = {
  coordinates: [number, number][]; // Array of [latitude, longitude]
};

export default function StravaMap({ coordinates }: StravaMapProps) {
  if (!coordinates.length) return <p className="text-gray-400">No GPS data available</p>;

  return (
    <MapContainer
      center={coordinates[0]} // Start at first coordinate
      zoom={13}
      className="w-full h-64 rounded-lg shadow-md"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={coordinates} color="blue" />
    </MapContainer>
  );
}
