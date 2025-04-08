"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { fetchActivities, fetchLaps, extractIntervalsFromLaps, StravaActivity } from "@/utils/strava";

// Dynamically import StravaMap to disable SSR (fixes window is not defined error)
const StravaMap = dynamic(() => import("@/components/StravaMap"), { ssr: false });
const IntervalGraph = dynamic(() => import("@/components/IntervalGraph"), { ssr: false });


export default function ActivitiesList() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMoreActivities();
  }, []);

  const loadMoreActivities = async () => {
    setLoading(true);
    try {
      const newActivities = await fetchActivities(page);
      setActivities((prev) => [...prev, ...newActivities]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Activities</h2>
      <ul className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full space-y-4">
      {activities.map((activity, index) => (
          <li
            key={index}
            className="p-4 border rounded-lg shadow-sm hover:bg-gray-50 space-y-2"
          >
            <h2 className="text-lg font-semibold">{activity.name}</h2>
            <p className="text-gray-600">Distance: {(activity.distance / 1000).toFixed(2)} km</p>
            <p className="text-gray-500 text-sm">Date: {new Date(activity.date).toLocaleDateString()}</p>
            <button
      className="mt-2 px-2 py-1 text-sm bg-blue-500 text-white rounded"
      onClick={async () => {
        const laps = await fetchLaps(activity.id);
        const intervals = extractIntervalsFromLaps(laps);
        setActivities((prev) =>
          prev.map((act, i) => (i === index ? { ...act, intervals } : act))
        );
      }}
    >
      Show Intervals
    </button>

    {activity.intervals && (
      <IntervalGraph intervals={activity.intervals} />
    )}
            {/* Show Map if Coordinates are Available */}
            {activity.coordinates && activity.coordinates.length > 0 ? (
              <div className="mt-4">
                <StravaMap coordinates={activity.coordinates} />
              </div>
            ) : (
              <p className="text-gray-400 italic">No map data available</p>
            )}
          </li>
        ))}
      </ul>
      <button 
        onClick={loadMoreActivities} 
        disabled={loading} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-300"
      >
        {loading ? 'Loading...' : 'Load More Activities'}
      </button>
    </div>
  );
}
