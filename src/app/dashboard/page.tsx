"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data: me } = useSWR("/api/me", fetcher);
  const loggedIn = !!me?.loggedIn;
  const { data: profile, isLoading } = useSWR(loggedIn ? "/api/destiny/profile" : null, fetcher);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Using global <Header /> from layout */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {!loggedIn ? (
          <div className="p-6 rounded-lg border border-border">
            <p className="mb-4">You are not logged in.</p>
            <a href="/api/auth/bungie/login" className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-4 py-2">Login with Bungie.net</a>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse text-muted-foreground">Loading profile…</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(profile?.characters?.data || {}).map((ch: any) => {
              const equipment = profile?.characterEquipment?.data?.[ch.characterId]?.items || [];
              const emblem = profile?.profile?.data?.userInfo?.iconPath || ch.emblemPath;
              return (
                <div key={ch.characterId} className="rounded-xl overflow-hidden border border-border bg-card">
                  <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(https://www.bungie.net${ch.emblemBackgroundPath || emblem})` }} />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">{classNameFromType(ch.classType)}</div>
                        <div className="text-2xl font-bold">{ch.light}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div>Power</div>
                        <div className="text-muted-foreground">{new Date(ch.dateLastPlayed).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {equipment.slice(0, 10).map((it: any) => (
                        <div key={it.itemInstanceId || it.itemHash} className="aspect-square rounded bg-muted/50 border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                          {it.bucketHash}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
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