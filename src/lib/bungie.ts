const BUNGIE_AUTH_BASE = "https://www.bungie.net";
const BUNGIE_API_BASE = "https://www.bungie.net/Platform";

export function getBungieAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.BUNGIE_CLIENT_ID as string,
    response_type: "code",
    state,
    redirect_uri: process.env.BUNGIE_OAUTH_REDIRECT_URI as string,
  });
  return `${BUNGIE_AUTH_BASE}/en/OAuth/Authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.BUNGIE_CLIENT_ID as string,
    redirect_uri: process.env.BUNGIE_OAUTH_REDIRECT_URI as string,
  });
  
  // Only add client_secret if it exists (for confidential clients)
  if (process.env.BUNGIE_CLIENT_SECRET) {
    params.append('client_secret', process.env.BUNGIE_CLIENT_SECRET);
  }
  const res = await fetch(`${BUNGIE_API_BASE}/App/OAuth/Token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function bungieApi(path: string, accessToken?: string, init: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${BUNGIE_API_BASE}${path}`;
  const headers: Record<string, string> = {
    "X-API-Key": process.env.BUNGIE_API_KEY as string,
    ...(init.headers as Record<string, string> | undefined),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Bungie API error: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function getCurrentUser(accessToken: string) {
  return bungieApi("/User/GetMembershipsForCurrentUser/", accessToken);
}

export async function getProfile(membershipType: number, membershipId: string, components: number[], accessToken: string) {
  const params = new URLSearchParams({ components: components.join(",") });
  return bungieApi(`/Destiny2/${membershipType}/Profile/${membershipId}/?${params.toString()}`, accessToken);
}