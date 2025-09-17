import { NextResponse } from "next/server";
import { bungieApi } from "@/lib/bungie";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });
  try {
    const data = await bungieApi(`/Destiny2/Armory/Search/DestinyInventoryItemDefinition/${encodeURIComponent(q)}/`);
    return NextResponse.json(data?.Response ?? data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Search failed" }, { status: 500 });
  }
}