import Link from "next/link";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { HeroDemo } from "@/components/landing/hero-demo";
import { JoinCodeForm } from "@/components/landing/join-code-form";
import { LandingStats } from "@/components/landing/landing-stats";

const STEPS = [
  {
    title: "Bid blind",
    body: "Before anyone sees the topic, everyone locks in how many answers they think they can name.",
    tone: "text-uv-soft",
  },
  {
    title: "The reveal",
    body: "The topic drops for the whole room at once. Fruits? Capitals? Pixar films? You find out together.",
    tone: "text-cyan",
  },
  {
    title: "Race the clock",
    body: "Twenty seconds. Type, hit Enter, repeat. Each answer is checked against a 30,000-answer knowledge base.",
    tone: "text-volt",
  },
];

export default function Home() {
  return (
    <main className="relative">
      <Backdrop />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="md" />
        <nav className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:text-text">
            My games
          </Link>
          <Link href="/create" className="rounded-lg px-3 py-2 text-text hover:text-volt">
            Host
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-14">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-night/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan sm:text-xs sm:tracking-[0.2em]">
            2–30 players · no sign-up
          </p>
          <h1 className="font-display text-[clamp(3.6rem,11vw,8.5rem)] font-black uppercase leading-[0.82] tracking-tight">
            How many
            <br />
            can you <span className="text-volt-glow">name?</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Bid on yourself before you see the topic. Hit your number in 20 seconds and you bank it. Fall one short
            and you get nothing. Overconfidence is the whole game.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/create"
              className="inline-flex h-14 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl bg-volt px-8 font-display text-xl font-extrabold uppercase tracking-wide text-[#0a0d00] shadow-[0_6px_0_var(--volt-deep),0_14px_40px_rgb(200_255_46/0.25)] transition active:translate-y-1 active:shadow-[0_2px_0_var(--volt-deep)]"
            >
              Host a game
            </Link>
            <span className="hidden text-sm font-semibold uppercase tracking-widest text-faint sm:block">or</span>
            <JoinCodeForm />
          </div>
        </div>

        <HeroDemo />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="mb-8 font-display text-4xl font-black uppercase sm:text-5xl">One round, three moves</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="panel p-6">
              <span className={`font-display text-6xl font-black ${s.tone}`}>{i + 1}</span>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="panel mt-6 grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="font-display text-3xl font-extrabold uppercase">The only rule that matters</h3>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
              Meet your bid and you score exactly your bid. Bid 5, name 6 fruits: <b className="text-volt">5 points</b>. Bid
              7, name 6: <b className="text-hot">zero</b>. Duplicates and wrong answers don&apos;t count, so a bold bid pays
              — until it doesn&apos;t.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm">
            <div className="rounded-xl border border-volt/40 bg-volt/10 px-4 py-3 text-volt">
              bid 5 · got 6 → <b>+5</b>
            </div>
            <div className="rounded-xl border border-hot/40 bg-hot/10 px-4 py-3 text-hot">
              bid 7 · got 6 → <b>0</b>
            </div>
          </div>
        </div>

        <LandingStats />
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-faint">
        ListOff · answers checked against a curated database — no AI guessing, no arguments.
      </footer>
    </main>
  );
}
