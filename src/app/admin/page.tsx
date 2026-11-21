"use client";

import { useEffect, useState } from "react";
import { BarChart3, Flag, KeyRound, LibraryBig, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { AppealsPanel } from "@/components/admin/appeals-panel";
import { adminFetch } from "@/components/admin/admin-fetch";
import { KnowledgeBase } from "@/components/admin/knowledge-base";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { ArcadeButton } from "@/components/game/arcade-button";
import { cn } from "@/lib/utils";

type Tab = "analytics" | "appeals" | "topics";
const KEY = "listoff:admin";

function readSaved(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [secret, setSecret] = useState<string | null>(null); // set once the server accepts it
  const [checking, setChecking] = useState(true);

  // Re-unlock with a password entered earlier in this tab. Verified by the server, never trusted locally.
  useEffect(() => {
    Promise.resolve(readSaved())
      .then(async (saved) => {
        if (!saved) return;
        try {
          await adminFetch(saved, "/api/admin/appeals");
          setSecret(saved);
        } catch {
          try {
            sessionStorage.removeItem(KEY);
          } catch {}
        }
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <main className="grid min-h-dvh place-items-center text-muted-foreground">Loading…</main>;
  if (!secret) return <Login onUnlock={setSecret} />;
  return (
    <Dashboard
      secret={secret}
      onLock={() => {
        try {
          sessionStorage.removeItem(KEY);
        } catch {}
        setSecret(null);
      }}
    />
  );
}

function Login({ onUnlock }: { onUnlock: (s: string) => void }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <Backdrop />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await adminFetch(pw, "/api/admin/appeals");
            try {
              sessionStorage.setItem(KEY, pw);
            } catch {}
            onUnlock(pw);
          } catch (err) {
            toast.error((err as Error).message);
            setBusy(false);
          }
        }}
        className="panel w-full max-w-sm space-y-4 p-6"
      >
        <Logo size="sm" />
        <h1 className="font-display text-4xl font-black uppercase">Admin</h1>
        <p className="text-sm text-muted-foreground">Enter the admin password to continue.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="current-password"
          className="h-12 w-full rounded-xl border border-line-strong bg-ink/60 px-4 focus:border-uv focus:outline-none"
          placeholder="Password"
          autoFocus
        />
        <ArcadeButton type="submit" size="md" className="w-full" loading={busy} disabled={!pw}>
          <KeyRound className="size-4" /> Unlock
        </ArcadeButton>
      </form>
    </main>
  );
}

function Dashboard({ secret, onLock }: { secret: string; onLock: () => void }) {
  const [tab, setTab] = useState<Tab>("analytics");
  const [topicId, setTopicId] = useState<number | undefined>();
  const [pending, setPending] = useState<number | null>(null);

  const refreshPending = () =>
    adminFetch<{ appeals: unknown[] }>(secret, "/api/admin/appeals?status=PENDING")
      .then((r) => setPending(r.appeals.length))
      .catch(() => {});
  useEffect(() => {
    refreshPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof BarChart3; badge?: number | null }[] = [
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "appeals", label: "Appeals", icon: Flag, badge: pending },
    { key: "topics", label: "Knowledge base", icon: LibraryBig },
  ];

  return (
    <main className="relative min-h-dvh">
      <Backdrop />
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Logo size="sm" />
        <nav className="flex gap-1 rounded-xl border border-line bg-night/70 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold",
                tab === t.key ? "bg-uv text-white" : "text-muted-foreground hover:text-text",
              )}
            >
              <t.icon className="size-4" /> {t.label}
              {!!t.badge && <span className="rounded-full bg-hot px-1.5 text-xs text-white">{t.badge}</span>}
            </button>
          ))}
        </nav>
        <button onClick={onLock} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-text">
          <LogOut className="size-4" /> Lock
        </button>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {tab === "analytics" && <AnalyticsPanel secret={secret} />}
        {tab === "appeals" && (
          <AppealsPanel
            secret={secret}
            onChanged={refreshPending}
            onOpenTopic={(id) => {
              setTopicId(id);
              setTab("topics");
            }}
          />
        )}
        {tab === "topics" && <KnowledgeBase key={topicId ?? "all"} secret={secret} initialTopicId={topicId} />}
      </div>
    </main>
  );
}
