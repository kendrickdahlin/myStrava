"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  fetchActivities,
  fetchLaps,
  extractIntervalsFromLaps,
  StravaActivity,
  PERSONAL_ACCESS_TOKEN,
} from "@/utils/strava";
import { formatDuration, formatPace } from "@/utils/format";

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
      const token = PERSONAL_ACCESS_TOKEN;

      const newActivities = await fetchActivities(page);
      const enrichedActivities = await Promise.all(
        newActivities.map(async (activity) => {
          const laps = await fetchLaps(activity.id);
          const intervals = extractIntervalsFromLaps(laps);
          return {
            ...activity,
            lapCount: laps.length,
            intervals: intervals.length > 1 ? intervals : undefined,
            showMap: intervals.length <= 1,
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Activities</h2>

      <ul className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full space-y-4">
        {activities.map((activity, index) => {
          const distanceKm = (activity.distance / 1000).toFixed(2);
          const duration = activity.moving_time || activity.elapsed_time || 0;
          const durationStr = formatDuration(duration);
          const paceMinPerKm = formatPace(duration / (activity.distance / 1000));
          const formattedDate = new Date(activity.date || activity.start_date).toLocaleDateString();

          return (
            <li
              key={index}
              className="relative p-6 border rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all space-y-4"
            >
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <p>{formattedDate}</p>
                {activity.intervals && activity.intervals.length > 1 && (
                  <button onClick={() => toggleView(index)} className="text-blue-600 hover:underline">
                    {activity.showMap ? "Show Intervals" : "Show Map"}
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-1">{activity.name}</h2>
              <p className="text-gray-500 text-sm italic mb-2">Run · {durationStr}</p>

              <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-700 font-medium border-y py-2">
                <div>
                  <div className="text-lg font-semibold">{distanceKm} km</div>
                  <div>Distance</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{paceMinPerKm}</div>
                  <div>Pace</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{durationStr}</div>
                  <div>Time</div>
                </div>
              </div>

              {activity.intervals && activity.intervals.length > 1 && !activity.showMap && (
                <IntervalGraph intervals={activity.intervals} />
              )}

              {!activity.intervals && activity.lapCount && activity.lapCount > 1 && (
                <button
                  className="mt-2 px-2 py-1 text-sm bg-blue-500 text-white rounded"
                  onClick={async () => {
                    const laps = await fetchLaps(activity.id);
                    const intervals = extractIntervalsFromLaps(laps);
                    setActivities((prev) =>
                      prev.map((act, i) =>
                        i === index
                          ? {
                              ...act,
                              intervals: intervals.length > 1 ? intervals : undefined,
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
          );
        })}
      </ul>

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
