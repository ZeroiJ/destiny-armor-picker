import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { exchangeCodeForToken, getCurrentUser } from "@/lib/bungie";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  if (error) return NextResponse.redirect(`/error?message=${encodeURIComponent(error)}`);
  if (!code) return NextResponse.redirect(`/error?message=${encodeURIComponent("Missing code")}`);

  const session = await getSession();
  try {
    const token = await exchangeCodeForToken(code);
    const now = Date.now();
    session.accessToken = token.access_token;
    session.refreshToken = token.refresh_token;
    session.expiresAt = now + token.expires_in * 1000;

    // Fetch memberships to store primary membership
    const memberships = await getCurrentUser(session.accessToken!);
    const bungieNetUser = memberships?.Response?.bungieNetUser;
    session.bungieNetUser = bungieNetUser;

    // pick a primary Destiny membership (usually first)
    const primary = memberships?.Response?.destinyMemberships?.[0];
    if (primary) {
      session.membershipId = primary.membershipId;
      session.membershipType = primary.membershipType;
    }
    await session.save();
    return NextResponse.redirect("/dashboard");
  } catch (e: any) {
    console.error(e);
    return NextResponse.redirect(`/error?message=${encodeURIComponent(e.message || "Auth failed")}`);
  }
}