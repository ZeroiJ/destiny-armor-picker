import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getProfile } from "@/lib/bungie";

// DestinyComponentType enums
// 100 = Profiles, 200 = Characters, 201 = CharacterInventories, 205 = CharacterEquipment, 102 = ProfileInventories
const COMPONENTS = [100, 200, 201, 205, 102];

export async function GET() {
  const session = await getSession();
  if (!session.accessToken || !session.membershipId || !session.membershipType) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const data = await getProfile(
      session.membershipType,
      session.membershipId,
      COMPONENTS,
      session.accessToken
    );
    return NextResponse.json(data?.Response ?? data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load profile" }, { status: 500 });
  }
}