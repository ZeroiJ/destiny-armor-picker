"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const sp = useSearchParams();
  const message = sp.get("message") || "An unexpected error occurred.";
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center rounded-lg px-4 py-2 border border-border hover:bg-muted/40">Back Home</Link>
          <a href="/api/auth/bungie/login" className="inline-flex items-center rounded-lg px-4 py-2 bg-foreground text-background hover:opacity-90">Try Login Again</a>
        </div>
      </div>
    </main>
  );
}