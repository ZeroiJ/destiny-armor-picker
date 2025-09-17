"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export const Header: React.FC = () => {
  const [me, setMe] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (active) setMe(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const loggedIn = !!me?.loggedIn;

  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur z-20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-base sm:text-lg font-semibold tracking-tight">
            Destiny Companion
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link className="hover:underline" href="/dashboard">Dashboard</Link>
            <Link className="hover:underline" href="/inventory">Inventory</Link>
            <Link className="hover:underline" href="/weapons">Weapons</Link>
            <Link className="hover:underline" href="/loadouts">Loadouts</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {loggedIn ? (
            <>
              {me?.bungieNetUser?.displayName && (
                <span className="text-muted-foreground hidden sm:inline">{me.bungieNetUser.displayName}</span>
              )}
              <button
                onClick={handleLogout}
                className="rounded border border-border px-3 py-1.5 hover:bg-muted/60"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/api/auth/bungie/login"
              className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-3 py-1.5 hover:opacity-90"
            >
              Login with Bungie.net
            </a>
          )}
        </div>
      </div>
    </header>
  );
};