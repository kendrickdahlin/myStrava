"use client"; 

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

type StravaMapProps = {
  activityCoordinates: [number, number][];
};

const StravaMap = ({ activityCoordinates }: StravaMapProps) => {
  if (!activityCoordinates.length) return <p className="text-center text-gray-500">No activity data</p>;

  const center: LatLngExpression = activityCoordinates[0];

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 max-w-3xl w-full mx-auto">
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
        📍 Activity Route
      </h2>
      <div className="rounded-lg overflow-hidden border border-gray-300 shadow-md" style={{ height: "500px" }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={activityCoordinates} pathOptions={{ color: "blue" }} />
        </MapContainer>
      </div>
    </div>
  );
};

export default StravaMap;
