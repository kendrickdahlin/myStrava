import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/utils/strava";

let accessToken = process.env.STRAVA_ACCESS_TOKEN;

export async function GET(req: Request) {
  console.log("API Request Received");

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";

  try {
    let response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=5`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // If Unauthorized (Token Expired), Refresh Token
    if (response.status === 401) {
      console.log("Access token expired, refreshing...");
      accessToken = await refreshAccessToken();
      response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=5`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    }

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: response.statusText }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from Strava API:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
