"use client";

import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type SearchResponse = { results: { results: any[] } } | any;

export default function WeaponsPage() {
  const [q, setQ] = useState("");
  const [debounced] = useDebounce(q, 300);
  const { data, isLoading } = useSWR<SearchResponse>(debounced ? `/api/destiny/search?q=${encodeURIComponent(debounced)}` : null, fetcher);
  const results: any[] = data?.results?.results || data?.results || [];

  return (
    <div className="min-h-screen">
      {/* Using global <Header /> from layout */}
      <main className="max-w-5xl mx-auto p-4">
        <div className="flex gap-3 mb-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search weapons, armor, perks…" className="w-full rounded-lg border border-border px-3 py-2 bg-background" />
        </div>
        {isLoading && <div className="text-muted-foreground">Searching…</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r: any) => (
            <div key={r.hash || r.hashId || r.itemHash} className="border border-border rounded-xl overflow-hidden">
              <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(https://source.unsplash.com/featured/400x200?destiny,weapon&sig=${r.hash || r.hashId || r.itemHash})` }} />
              <div className="p-3">
                <div className="font-semibold text-sm">{r.displayProperties?.name || r.name || "Unknown"}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{r.displayProperties?.description}</div>
                <div className="text-[10px] text-muted-foreground mt-2">Hash: {r.hash || r.itemHash}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}