import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBungieAuthorizeUrl } from "@/lib/bungie";

/**
 * Initiates OAuth authentication flow with Bungie.net
 * Generates and stores CSRF state parameter for security
 */
export async function GET() {
  const session = await getSession();
  
  // Generate cryptographically secure state parameter for CSRF protection
  const state = crypto.randomUUID().replace(/-/g, '');
  
  // Store state in session for later verification
  session.oauthState = state;
  session.expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes for OAuth flow
  await session.save();
  
  // Redirect to Bungie OAuth authorization endpoint
  const authUrl = getBungieAuthorizeUrl(state);
  return NextResponse.redirect(authUrl);
}