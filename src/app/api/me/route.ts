import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  const loggedIn = !!session.accessToken && !!session.membershipId && !!session.membershipType;
  return NextResponse.json({
    loggedIn,
    bungieNetUser: session.bungieNetUser || null,
    membershipId: session.membershipId || null,
    membershipType: session.membershipType || null,
    expiresAt: session.expiresAt || null,
  });
}