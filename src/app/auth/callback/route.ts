import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { exchangeCodeForToken, getCurrentUser } from "@/lib/bungie";

/**
 * Handles OAuth callback from Bungie.net authentication
 * Processes authorization code and establishes user session
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extract OAuth parameters from query string
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  try {
    // Handle OAuth errors from provider
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      const url = new URL("/error", request.url);
      url.searchParams.set("message", errorDescription || error);
      return NextResponse.redirect(url, { status: 302 });
    }

    // Validate required parameters
    if (!code) {
      console.error("Missing authorization code in callback");
      const url = new URL("/error", request.url);
      url.searchParams.set("message", "Missing authorization code");
      return NextResponse.redirect(url, { status: 302 });
    }

    if (!state) {
      console.error("Missing state parameter in callback");
      const url = new URL("/error", request.url);
      url.searchParams.set("message", "Missing state parameter");
      return NextResponse.redirect(url, { status: 302 });
    }

    // Get current session for state validation
    const session = await getSession();
    
    // CSRF Protection: Verify state parameter against stored session state
    if (!session.oauthState) {
      console.error("No stored OAuth state found in session");
      const url = new URL("/error", request.url);
      url.searchParams.set("message", "Invalid authentication session");
      return NextResponse.redirect(url, { status: 302 });
    }

    if (state !== session.oauthState) {
      console.error("OAuth state mismatch - potential CSRF attack");
      const url = new URL("/error", request.url);
      url.searchParams.set("message", "Invalid state parameter - authentication failed");
      return NextResponse.redirect(url, { status: 302 });
    }

    // Clear the used state parameter to prevent replay attacks
    session.oauthState = undefined;

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    const now = Date.now();
    
    // Store tokens in session
    session.accessToken = tokenResponse.access_token;
    session.refreshToken = tokenResponse.refresh_token;
    session.expiresAt = now + tokenResponse.expires_in * 1000;

    // Fetch user profile and memberships
    const memberships = await getCurrentUser(session.accessToken!);
    const bungieNetUser = memberships?.Response?.bungieNetUser;
    
    if (!bungieNetUser) {
      throw new Error("Failed to retrieve user profile from Bungie.net");
    }

    session.bungieNetUser = bungieNetUser;

    // Set primary Destiny membership (usually the first one)
    const destinyMemberships = memberships?.Response?.destinyMemberships;
    if (destinyMemberships && destinyMemberships.length > 0) {
      const primaryMembership = destinyMemberships[0];
      session.membershipId = primaryMembership.membershipId;
      session.membershipType = primaryMembership.membershipType;
    }

    // Save session with all authentication data
    await session.save();

    // Successful authentication - redirect to dashboard
    const successUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(successUrl, { status: 302 });

  } catch (error: any) {
    console.error("Authentication callback error:", error);
    
    // Provide user-friendly error message
    const errorMessage = error.message || "Authentication failed. Please try again.";
    const url = new URL("/error", request.url);
    url.searchParams.set("message", errorMessage);
    return NextResponse.redirect(url, { status: 302 });
  }
}