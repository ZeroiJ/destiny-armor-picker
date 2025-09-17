"use client";

import { useMemo, useState } from "react";

const STAT_NAMES = ["Mobility", "Resilience", "Recovery", "Discipline", "Intellect", "Strength"] as const;

type StatKey = typeof STAT_NAMES[number];

type Stats = Record<StatKey, number>;

function clamp(n: number, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }

export default function LoadoutsPage() {
  const [target, setTarget] = useState<Stats>({ Mobility: 60, Resilience: 70, Recovery: 70, Discipline: 50, Intellect: 40, Strength: 60 });

  const tiers = useMemo(() => {
    const pairs = Object.entries(target).map(([k, v]) => [k, Math.floor(clamp(v) / 10)] as [string, number]);
    const total = pairs.reduce((a, [, t]) => a + t, 0);
    return { pairs, total };
  }, [target]);

  return (
    <div className="min-h-screen">
      {/* Using global <Header /> from layout */}
      <main className="max-w-5xl mx-auto p-4 grid gap-6 md:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Target Stats</h2>
          {STAT_NAMES.map((name) => (
            <div key={name} className="flex items-center gap-3">
              <label className="w-28 text-sm">{name}</label>
              <input type="range" min={0} max={100} step={10} value={target[name]} onChange={(e) => setTarget((s) => ({ ...s, [name]: Number(e.target.value) }))} className="w-full" />
              <div className="w-8 text-right text-sm">{target[name]}</div>
              <div className="w-8 text-right text-xs text-muted-foreground">T{Math.floor(target[name] / 10)}</div>
            </div>
          ))}
        </section>
        <section className="border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Suggestion</h2>
          <p className="text-sm text-muted-foreground mb-4">This lightweight preview sums tiers and helps set goals. A full optimizer can iterate armor rolls and mods.</p>
          <ul className="text-sm space-y-1">
            {tiers.pairs.map(([k, t]) => (
              <li key={k} className="flex justify-between"><span>{k}</span><span>Tier {t}</span></li>
            ))}
          </ul>
          <div className="mt-4 text-sm">Total tiers: <span className="font-semibold">{tiers.total}</span> / 30</div>
        </section>
      </main>
    </div>
  );
}