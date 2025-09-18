export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function Home() {
  // Server-side check for session; works on Vercel and avoids client-only redirects
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    const baseUrl = host ? `${proto}://${host}` : "";

    const res = await fetch(`${baseUrl}/api/me`, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      if (d?.loggedIn) redirect("/dashboard");
    }
  } catch {}

  return (
    <main className="min-h-screen bg-[url('https://images.unsplash.com/photo-1517466787929-af1d2dac0f1a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-6">
      <div className="backdrop-blur-md bg-black/40 text-white max-w-2xl w-full rounded-xl p-8 border border-white/10">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Destiny Companion</h1>
        <p className="mt-3 text-white/80">Login with Bungie.net to view your Guardians, manage inventory, search weapons and armor, and optimize builds.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a href="/api/auth/bungie/login" className="inline-flex items-center justify-center rounded-lg bg-white text-black px-5 py-3 font-medium hover:bg-white/90 transition">Login with Bungie.net</a>
          <a href="/dashboard" className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 font-medium hover:bg-white/10 transition">Go to Dashboard</a>
        </div>
      </div>
    </main>
  );
}