import Link from "next/link";
import { ArrowRight, Trophy, User, Users } from "lucide-react";
import { JoinCodeForm } from "./join-code-form";

/** The two ways to play, given equal billing on the home screen. */
export function ModeCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-volt/40 bg-night/70 p-6 sm:p-8 shadow-[0_0_50px_rgb(200_255_46/0.12)] transition hover:-translate-y-1 hover:border-volt/70 hover:shadow-[0_0_70px_rgb(200_255_46/0.22)]">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-volt/15 blur-3xl" />
        <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-volt">
          <Users className="size-4" /> Party mode
        </p>
        <h2 className="relative mt-2 font-display text-5xl font-black uppercase leading-none sm:text-6xl">Host a game</h2>
        <p className="relative mt-3 flex-1 text-base text-muted-foreground">2–30 friends, one link or QR code. No sign-up.</p>
        <Link
          href="/create"
          className="relative mt-4 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-volt px-6 font-display text-xl font-extrabold uppercase tracking-wide text-[#0a0d00] shadow-[0_6px_0_var(--volt-deep)] transition active:translate-y-1 active:shadow-[0_2px_0_var(--volt-deep)]"
        >
          Host a game <ArrowRight className="size-5 transition group-hover:translate-x-1" />
        </Link>
        <div className="relative mt-3">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-faint">or join with a code</p>
          <JoinCodeForm />
        </div>
      </div>

      <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-uv/50 bg-night/70 p-6 sm:p-8 shadow-[0_0_50px_rgb(139_92_255/0.15)] transition hover:-translate-y-1 hover:border-uv/80 hover:shadow-[0_0_70px_rgb(139_92_255/0.28)]">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-uv/25 blur-3xl" />
        <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-uv-soft">
          <User className="size-4" /> Solo mode
        </p>
        <h2 className="relative mt-2 font-display text-5xl font-black uppercase leading-none sm:text-6xl">Play solo</h2>
        <p className="relative mt-3 flex-1 text-base text-muted-foreground">
          Random topics, any time. Every point climbs your university, state and national leaderboards.
        </p>
        <Link
          href="/solo"
          className="relative mt-4 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-uv px-6 font-display text-xl font-extrabold uppercase tracking-wide text-white shadow-[0_6px_0_#4a1fd1] transition active:translate-y-1 active:shadow-[0_2px_0_#4a1fd1]"
        >
          Play solo <ArrowRight className="size-5 transition group-hover:translate-x-1" />
        </Link>
        <Link
          href="/leaderboards"
          className="relative mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-line-strong bg-ink/60 font-semibold text-muted-foreground transition hover:border-amber/60 hover:text-amber"
        >
          <Trophy className="size-4" /> View leaderboards
        </Link>
      </div>
    </div>
  );
}
