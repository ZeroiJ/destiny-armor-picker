import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBungieAuthorizeUrl } from "@/lib/bungie";

export async function GET() {
  const session = await getSession();
  const state = Math.random().toString(36).slice(2);
  session.expiresAt = Date.now() + 5 * 60 * 1000; // short-lived placeholder
  await session.save();
  const url = getBungieAuthorizeUrl(state);
  return NextResponse.redirect(url);
}