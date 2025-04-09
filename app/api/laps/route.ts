import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("activityId");

  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!activityId || !token) {
    return NextResponse.json(
      { error: "Missing activity ID or authorization token" },
      { status: 400 }
    );
  }

  console.log("Fetching laps for activity ID:", activityId);

  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/laps`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Strava API error:", error);
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching laps:", error);
    return NextResponse.json({ error: "Failed to fetch laps" }, { status: 500 });
  }
}
