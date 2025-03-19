export type StravaActivity = {
  id: number;
  name: string;
  distance: number; // In meters
  date: string;
  coordinates: [number, number][]; // Array of lat/lng pairs
};

export async function getStravaActivities(count: number): Promise<StravaActivity[]> {
  try {
    const response = await fetch("/api/strava?limit=" + count);
    const data = await response.json();

    return data.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      date: activity.start_date,
      coordinates: activity.map.summary_polyline ? decodePolyline(activity.map.summary_polyline) : [],
    }));
  } catch (error) {
    console.error("Error fetching Strava activities:", error);
    return [];
  }
}

// Function to decode Strava polyline into lat/lng pairs
function decodePolyline(polyline: string): [number, number][] {
  // Import polyline decoder (install with `npm install polyline`)
  const polylineDecoder = require("@mapbox/polyline");
  return polylineDecoder.decode(polyline);
}
