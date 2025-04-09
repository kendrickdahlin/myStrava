import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await response.json();

  if (!tokenData.access_token) {
    console.error("OAuth token exchange failed:", tokenData);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect to home page with access token in URL
  return NextResponse.redirect(
    new URL(`/?access_token=${tokenData.access_token}`, req.url)
  );
}
