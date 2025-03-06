import polyline from "@mapbox/polyline";

export async function getStravaActivities(activityCount: number): Promise<[number, number][]> {
  try {
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
        refresh_token: process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Failed to get access token");

    const activitiesRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=5",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const activities = await activitiesRes.json();

    if (activities.length > 0 && activities[0].map?.summary_polyline) {
      const decodedPolyline: [number, number][] = polyline.decode(
        activities[0].map.summary_polyline
      ) as [number, number][]; // ✅ Explicitly cast to correct type

      return decodedPolyline;
    }

    return [];
  } catch (error) {
    console.error("Error fetching Strava data:", error);
    return [];
  }
}
