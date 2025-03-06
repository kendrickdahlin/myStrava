// const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
// const CLIENT_SECRET = process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET;
// const REFRESH_TOKEN = process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN;

const CLIENT_ID=128406
const CLIENT_SECRET=`2364231d16fad6e8b46d57823599066b6621d331`
const REFRESH_TOKEN =`aebb1d75f5871d0e045fe713ff69ca807b65d35b`

export async function getStravaData() {
  try {
    // Get a new access token using the refresh token
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch Strava activities
    const activitiesRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=5",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return await activitiesRes.json();
  } catch (error) {
    console.error("Error fetching Strava data:", error);
    return [];
  }
}
