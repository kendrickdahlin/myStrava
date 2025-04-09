"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  fetchActivities,
  fetchLaps,
  extractIntervalsFromLaps,
  StravaActivity,
} from "@/utils/strava";

const StravaMap = dynamic(() => import("@/components/StravaMap"), {
  ssr: false,
});
const IntervalGraph = dynamic(() => import("@/components/IntervalGraph"), {
  ssr: false,
});

export default function ActivitiesList() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  {/* Check if token is available */}
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token") || localStorage.getItem("strava_token");
  
    if (accessToken) {
      localStorage.setItem("strava_token", accessToken);
      setToken(accessToken);
      window.history.replaceState({}, document.title, "/"); // clean URL
    }
  }, []);
  {/* Load activities*/}
  useEffect(() => {
    if (token) {
      loadMoreActivities();
    }
  }, [token]);

  const loadMoreActivities = async () => {
    if (!token) return; // Just in case
    setLoading(true);
    try {
      const newActivities = await fetchActivities(page, token);

      const enrichedActivities = await Promise.all(
        newActivities.map(async (activity) => {
          const laps = await fetchLaps(activity.id, token);
          const intervals = extractIntervalsFromLaps(laps);
          return {
            ...activity,
            lapCount: laps.length,
            intervals: intervals.length > 1 ? intervals : undefined,
            showMap: intervals.length <= 1, // default view
          };
        })
      );

      setActivities((prev) => [...prev, ...enrichedActivities]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
    setLoading(false);
  };

  const toggleView = (index: number) => {
    setActivities((prev) =>
      prev.map((act, i) =>
        i === index ? { ...act, showMap: !act.showMap } : act
      )
    );
  };


  {/* Check if token is available */}
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <a
          href={`https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback&approval_prompt=force&scope=read,activity:read_all`}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg"
        >
          Connect to Strava
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Activities</h2>
      {/*Activity List*/}
      <ul className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full space-y-4">
        {activities.map((activity, index) => (
          <li
            key={index}
            className="relative p-4 border rounded-lg shadow-sm hover:bg-gray-50 space-y-2"
          >
            {/* Toggle Button */}
            {activity.intervals && activity.intervals.length > 1 && (
              <button
                onClick={() => toggleView(index)}
                className="absolute top-2 right-2 text-sm text-blue-600 hover:underline"
              >
                {activity.showMap ? "Show Intervals" : "Show Map"}
              </button>
            )}

            <h2 className="text-lg font-semibold">{activity.name}</h2>
            <p className="text-gray-600">
              Distance: {(activity.distance / 1000).toFixed(2)} km
            </p>
            <p className="text-gray-500 text-sm">
              Date: {new Date(activity.date).toLocaleDateString()}
            </p>

            {/* Interval Graph */}
            {activity.intervals &&
              activity.intervals.length > 1 &&
              !activity.showMap && (
                <IntervalGraph intervals={activity.intervals} />
              )}

            {/* Show Intervals Button if not yet loaded, and more than one lap */}
            {!activity.intervals &&
              activity.lapCount &&
              activity.lapCount > 1 && (
                <button
                  className="mt-2 px-2 py-1 text-sm bg-blue-500 text-white rounded"
                  onClick={async () => {
                    const laps = await fetchLaps(activity.id, token);
                    const intervals = extractIntervalsFromLaps(laps);
                    setActivities((prev) =>
                      prev.map((act, i) =>
                        i === index
                          ? {
                              ...act,
                              intervals:
                                intervals.length > 1 ? intervals : undefined,
                              showMap: true,
                            }
                          : act
                      )
                    );
                  }}
                >
                  Show Intervals ({activity.lapCount})
                </button>
              )}

            {/* Map View */}
            {(!activity.intervals || activity.showMap) &&
            activity.coordinates &&
            activity.coordinates.length > 0 ? (
              <div className="mt-4">
                <StravaMap coordinates={activity.coordinates} />
              </div>
            ) : (!activity.intervals || activity.showMap) ? (
              <p className="text-gray-400 italic">No map data available</p>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Load More Button */}
      <button
        onClick={loadMoreActivities}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-300"
      >
        {loading ? "Loading..." : "Load More Activities"}
      </button>
    </div>
  );
}
