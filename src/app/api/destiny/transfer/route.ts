import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { bungieApi } from "@/lib/bungie";

// Request body: { itemId, itemHash, characterId, toCharacter: boolean, stackSize? }
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.accessToken || !session.membershipType) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { itemId, itemHash, characterId, toCharacter = true, stackSize = 1 } = body || {};
  if (!itemId || !itemHash || !characterId) {
    return NextResponse.json({ error: "Missing itemId, itemHash, characterId" }, { status: 400 });
  }
  try {
    const res = await fetch(`https://www.bungie.net/Platform/Destiny2/Actions/Items/TransferItem/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.BUNGIE_API_KEY as string,
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        itemReferenceHash: Number(itemHash),
        stackSize: Number(stackSize) || 1,
        transferToVault: !toCharacter,
        itemId: itemId,
        characterId: characterId,
        membershipType: session.membershipType,
      }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || data?.ErrorStatus !== "Success") {
      return NextResponse.json({ error: data?.Message || `Transfer failed: ${res.status}` }, { status: 400 });
    }
    return NextResponse.json({ ok: true, response: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Transfer failed" }, { status: 500 });
  }
}