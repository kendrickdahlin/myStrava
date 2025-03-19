"use client";

import { useEffect, useState } from "react";
import StravaMap from "@/components/StravaMap";
import { getStravaActivities, StravaActivity } from "@/utils/strava";

export default function Home() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [activityCount, setActivityCount] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStravaActivities(activityCount)
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching activities:", err);
        setLoading(false);
      });
  }, [activityCount]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        My Strava Activities
      </h1>

      {/* Activity Count Selector */}
      <label className="mb-4 text-gray-700 font-medium">
        Show{" "}
        <select
          className="ml-2 px-3 py-1 border rounded-md shadow-sm bg-white"
          value={activityCount}
          onChange={(e) => setActivityCount(Number(e.target.value))}
        >
          <option value={1}>1</option>
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>{" "}
        activities
      </label>

      {/* Activity List */}
      {loading ? (
        <p className="text-gray-500">Loading activities...</p>
      ) : (
        <ul className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full space-y-4">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="p-4 border rounded-lg shadow-sm hover:bg-gray-50"
            >
              <h2 className="text-lg font-semibold">{activity.name}</h2>
              <p className="text-gray-600">
                Distance: {(activity.distance / 1000).toFixed(2)} km
              </p>
              <p className="text-gray-500 text-sm">
                Date: {new Date(activity.date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Show Map */}
      {activities.length > 0 && (
        <div className="mt-8">
          <StravaMap
            activityCoordinates={activities.flatMap((act) => act.coordinates)}
          />
        </div>
      )}
    </div>
  );
}
