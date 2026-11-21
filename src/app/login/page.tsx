"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { ArcadeButton } from "@/components/game/arcade-button";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

/** Only same-site paths: "/solo" yes, "//evil.com" or "https://…" no. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/solo";
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && password.length < 8) {
      toast.error("Use at least 8 characters for your password.");
      return;
    }
    setBusy(true);
    let res;
    try {
      res =
        mode === "signup"
          ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim() })
          : await authClient.signIn.email({ email: email.trim(), password });
    } catch {
      // A server or network failure used to leave the button spinning forever.
      setBusy(false);
      toast.error("We couldn't reach the sign-in service. Please try again in a moment.");
      return;
    }
    if (res.error) {
      setBusy(false);
      toast.error(res.error.message || (mode === "signup" ? "Couldn't create your account." : "Wrong email or password."));
      return;
    }
    toast.success(mode === "signup" ? "Account created — welcome!" : "Welcome back!");
    router.replace(next);
    router.refresh();
  }

  const input =
    "h-14 w-full rounded-2xl border border-line-strong bg-ink/60 pl-12 pr-4 text-lg placeholder:text-faint focus:border-volt focus:outline-none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <Logo size="md" />
      <div className="panel w-full p-6 sm:p-8">
        <div className="mb-6 grid grid-cols-2 rounded-2xl border border-line bg-ink/50 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "relative rounded-xl py-2.5 font-display text-lg font-extrabold uppercase tracking-wide transition",
                mode === m ? "text-[#0a0d00]" : "text-muted-foreground hover:text-text",
              )}
            >
              {mode === m && (
                <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-xl bg-volt" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{m === "signin" ? "Sign in" : "Create account"}</span>
            </button>
          ))}
        </div>

        <h1 className="font-display text-4xl font-black uppercase leading-none">
          {mode === "signin" ? "Welcome back" : "Play solo"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to keep stacking points on the leaderboards."
            : "Every point you score adds up — for you, your state and your university."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3 text-left">
          <AnimatePresence initial={false}>
            {mode === "signup" && (
              <motion.label
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative block overflow-hidden"
              >
                <span className="sr-only">Your name</span>
                <User className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-faint" />
                <input
                  required
                  autoComplete="name"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={input}
                />
              </motion.label>
            )}
          </AnimatePresence>
          <label className="relative block">
            <span className="sr-only">Email</span>
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-faint" />
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={input}
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Password</span>
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-faint" />
            <input
              required
              type="password"
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
              className={input}
            />
          </label>
          <ArcadeButton type="submit" size="xl" className="mt-2 w-full" loading={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </ArcadeButton>
        </form>
        <p className="mt-5 text-xs text-faint">
          Accounts are only needed for solo mode. Party games with friends never need one.
        </p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-10">
      <Backdrop tone="uv" />
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-night/60" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
