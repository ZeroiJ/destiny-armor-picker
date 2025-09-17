"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ItemRef = { itemId: string; itemHash: number; bucketHash?: number };

export default function InventoryPage() {
  const { data: me } = useSWR("/api/me", fetcher);
  const loggedIn = !!me?.loggedIn;
  const { data: profile } = useSWR(loggedIn ? "/api/destiny/profile" : null, fetcher);
  const [selectedItem, setSelectedItem] = useState<ItemRef | null>(null);
  const [target, setTarget] = useState<{ characterId: string | "vault" } | null>(null);
  const [moving, setMoving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const characters: any[] = useMemo(() => Object.values(profile?.characters?.data || {}), [profile]);
  const vaultItems: any[] = profile?.profileInventory?.data?.items || [];

  const allItems = useMemo(() => {
    const byChar = characters.flatMap((c: any) => (profile?.characterInventories?.data?.[c.characterId]?.items || []).map((it: any) => ({ ...it, owner: c.characterId })));
    const vault = vaultItems.map((it: any) => ({ ...it, owner: "vault" }));
    return [...byChar, ...vault];
  }, [characters, profile, vaultItems]);

  async function moveSelected() {
    if (!selectedItem || !target) return;
    if (!me?.membershipType) return;
    setMoving(true);
    setMessage(null);
    try {
      const toCharacter = target.characterId !== "vault";
      const characterId = toCharacter ? target.characterId : characters[0]?.characterId; // API requires a char id even to/from vault
      const res = await fetch("/api/destiny/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.itemId,
          itemHash: selectedItem.itemHash,
          characterId,
          toCharacter,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Transfer failed");
      setMessage("Transfer complete");
    } catch (e: any) {
      setMessage(e.message || "Transfer failed");
    } finally {
      setMoving(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Using global <Header /> from layout */}
      {!loggedIn ? (
        <div className="max-w-6xl mx-auto p-4">Please <a className="underline" href="/api/auth/bungie/login">login</a>.</div>
      ) : (
        <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          <section className="md:col-span-3">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">All Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {allItems.map((it: any) => (
                <button
                  key={(it.itemInstanceId || it.itemHash) + String(it.owner)}
                  onClick={() => setSelectedItem({ itemId: it.itemInstanceId || it.itemId, itemHash: it.itemHash, bucketHash: it.bucketHash })}
                  className={`aspect-square rounded border text-xs flex items-center justify-center ${selectedItem?.itemId === (it.itemInstanceId || it.itemId) ? "border-primary" : "border-border"}`}
                  title={`Hash ${it.itemHash}`}
                >
                  {it.bucketHash}
                </button>
              ))}
            </div>
          </section>

          <aside className="md:col-span-1 border border-border rounded-lg p-4 h-fit sticky top-20">
            <h3 className="font-semibold mb-3">Move Item</h3>
            <div className="text-sm mb-2">Selected: {selectedItem ? `#${selectedItem.itemHash}` : "None"}</div>
            <div className="space-y-2">
              <button onClick={() => setTarget({ characterId: "vault" })} className={`w-full rounded border px-3 py-2 text-left ${target?.characterId === "vault" ? "border-primary" : "border-border"}`}>Vault</button>
              {characters.map((c: any) => (
                <button key={c.characterId} onClick={() => setTarget({ characterId: c.characterId })} className={`w-full rounded border px-3 py-2 text-left ${target?.characterId === c.characterId ? "border-primary" : "border-border"}`}>
                  {classNameFromType(c.classType)} • {c.light}
                </button>
              ))}
            </div>
            <button disabled={!selectedItem || !target || moving} onClick={moveSelected} className="mt-4 w-full rounded-lg bg-foreground text-background px-4 py-2 disabled:opacity-50">
              {moving ? "Moving…" : "Move"}
            </button>
            {message && <div className="mt-2 text-sm text-muted-foreground">{message}</div>}
          </aside>
        </main>
      )}
    </div>
  );
}

function classNameFromType(t: number) {
  switch (t) {
    case 0:
      return "Titan";
    case 1:
      return "Hunter";
    case 2:
      return "Warlock";
    default:
      return "Guardian";
  }
}