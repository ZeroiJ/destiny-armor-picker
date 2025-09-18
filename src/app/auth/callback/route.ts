import { NextResponse } from "next/server";

// Handles OAuth providers that are configured to call /auth/callback
// We preserve all query params and forward to the existing Bungie handler
export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/api/auth/bungie/callback";
  return NextResponse.redirect(url.toString(), { status: 307 });
}