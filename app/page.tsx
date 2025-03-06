"use client"; 

import { useEffect, useState } from "react";
import StravaMap from "@/components/StravaMap";
import { getStravaActivities } from "@/utils/strava";

export default function Home() {
  const [activityCoords, setActivityCoords] = useState<[number, number][]>([]);
  const [activityCount, setActivityCount] = useState(5); // Default: 5 activities

  useEffect(() => {
    getStravaActivities(activityCount).then(setActivityCoords).catch(console.error);
  }, [activityCount]); // Refetch when activityCount changes

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🚴‍♂️ My Strava Activities
      </h1>

      {/* Dropdown for selecting number of activities */}
      <label className="mb-4 text-gray-700 font-medium">
        Show 
        <select
          className="ml-2 px-3 py-1 border rounded-md shadow-sm bg-white"
          value={activityCount}
          onChange={(e) => setActivityCount(Number(e.target.value))}
        >
          <option value={1}>1</option>
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
        activities
      </label>

      <StravaMap activityCoordinates={activityCoords} />
    </div>
  );
}
