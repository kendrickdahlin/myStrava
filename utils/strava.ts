import polyline from "@mapbox/polyline";
import { cachedDataVersionTag } from "v8";
export const PERSONAL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_STRAVA_ACCESS_TOKEN!;

export type StravaActivity = {
  start_date: string;
  elapsed_time: any;
  moving_time: any;
  showMap: any;
  id: number;
  name: string;
  distance: number;
  date: string;
  coordinates?: [number, number][];
  intervals?: { duration: number, distance: number }[];
  lapCount?: number;
};

export async function fetchActivities(page: number, token: string): Promise<StravaActivity[]> {
  console.log(`Fetching activities for page: ${page}`);
  try {
    const response = await fetch(`/api/strava?page=${page}&per_page=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    console.log("API Response:", data);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return data.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      date: activity.start_date,
      coordinates: activity.map?.summary_polyline
        ? decodePolyline(activity.map.summary_polyline)
        : [],
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

export function decodePolyline(encoded: string): [number, number][] {
  return polyline.decode(encoded);
}

let cachedAccessToken: string | null = null;
// Returns a cached access token if available, otherwise fetches a new one
// and caches it for future use.



export async function fetchLaps(activityId: number, token: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/laps?activityId=${activityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching laps: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch laps: ", error);
    return [];
  }
}


// Extract intervals from laps data
export function extractIntervalsFromLaps(laps: any[]): { duration: number, distance: number }[] {
  return laps.map(lap => ({
    duration: lap.moving_time,
    distance: lap.distance,
  }));
}

export function refreshAccessToken(): Promise<string> {
  console.log("Refreshing access token with refresh()");
  return fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.access_token) {
        throw new Error("Failed to refresh access token");
      }
      return data.access_token;
    });
}