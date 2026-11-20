import Link from "next/link";
import {
  Sparkles,
  CaseSensitive,
  Clock,
  Copy,
  Eye,
  Flag,
  Gauge,
  Layers,
  Repeat,
  ShieldCheck,
  Smartphone,
  SpellCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/how-to-play/reveal";
import { AnswerChecker, ScoringPlayground } from "@/components/how-to-play/playgrounds";
import {
  BidVisual,
  BoardVisual,
  HostVisual,
  JoinVisual,
  RaceVisual,
  RevealVisual,
} from "@/components/how-to-play/step-visuals";
import { BuiltBy } from "@/components/landing/developer-story";

export const metadata = {
  title: "How to play",
  description: "Learn ListOff in two minutes: see the topic, place your bid, race the clock, and score double.",
};

const STEPS = [
  {
    title: "The host opens a room",
    tone: "text-cyan",
    body: "One person hosts — ideally on a laptop or TV everyone can see. They pick how many rounds to play, how long each round lasts, and which categories to draw from. ListOff gives them a six-letter room code, an invite link, and a QR code.",
    tip: "The host runs the show and doesn't play, so their screen works great on a projector.",
    Visual: HostVisual,
  },
  {
    title: "Everyone joins on their phone",
    tone: "text-uv-soft",
    body: "Players scan the QR code or open the link, type a display name, and they're in. No app, no account, no download. Up to 30 people can play in one room, and everyone appears in the lobby the moment they join.",
    tip: "Refreshed by accident? Open the link again on the same device and you're right back in your seat.",
    Visual: JoinVisual,
  },
  {
    title: "See the topic, then bid",
    tone: "text-uv-soft",
    body: "Every round opens with the topic on every screen — Fruits, Pixar films, Japanese prefectures. Now bet on yourself: how many can you name? Lock in a number from 1 to 50. Once it's locked, it's locked.",
    tip: "Bids stay secret until everyone has locked in, so nobody can copy yours.",
    Visual: BidVisual,
  },
  {
    title: "Bids lock, clock starts",
    tone: "text-volt",
    body: "As soon as everyone has bid (or the bid timer runs out), bids lock on every screen at the same moment. A 3-2-1 countdown gives you a breath to think, and then the clock starts.",
    tip: "Topics never repeat within a game, and the game avoids dealing the same category twice in a row.",
    Visual: RevealVisual,
  },
  {
    title: "Race the clock",
    tone: "text-volt",
    body: "You get the time the host picked when creating the room (20 seconds by default). Type an answer, hit Enter, type the next. Each one is checked instantly: green for accepted, amber if you already named it, red if it isn't on the list. Tally marks track your progress toward your bid.",
    tip: "Wrong answers cost nothing, so if you're not sure, fire it in anyway.",
    Visual: RaceVisual,
  },
  {
    title: "Scores and the leaderboard",
    tone: "text-amber",
    body: "When time's up, every answer is tallied at once. You see what you got right, what didn't count, and the full list of answers nobody thought of. The leaderboard re-shuffles to show who climbed and who slid. Then the host starts the next round.",
    tip: "After the last round you get a podium, round-by-round scores, and awards for the sharpest bidder.",
    Visual: BoardVisual,
  },
];

const RULES = [
  { Icon: CaseSensitive, title: "Case and spacing don't matter", body: "APPLE, apple and “  Apple ” are all the same answer." },
  { Icon: SpellCheck, title: "Common spellings count", body: "Litchi = Lychee, Grey = Gray, NYC = New York City, Aubergine = Eggplant." },
  { Icon: Layers, title: "Plurals and accents are fine", body: "Grapes counts as Grape. Sao Paulo counts as São Paulo." },
  { Icon: Copy, title: "Each answer counts once", body: "Naming the same thing twice — even with a different spelling — scores it once." },
  { Icon: Sparkles, title: "Typos are autocorrected", body: "“Bananna”, “brocoli” and “Filipines” all count. Close misspellings snap to the right answer — but a different real answer (Slovenia for Slovakia) never does." },
  { Icon: ShieldCheck, title: "No AI, no arguments", body: "Every answer is checked against a hand-built list. The list is the referee." },
];

const TIPS = [
  { Icon: Target, title: "Bid for the topic you see", body: "You know the topic before you bid, so size it up. Every topic has a fixed list of at least 10 answers — no endless ones like “lakes”." },
  { Icon: TrendingUp, title: "Big bids for comebacks", body: "Answers up to your bid pay 2 each, so a bold 12 is worth 24+ — if you can back it up." },
  { Icon: Zap, title: "Type first, think later", body: "Short, obvious answers fly. Save the clever ones for when the easy ones run out." },
  { Icon: Gauge, title: "Keep going past your bid", body: "Once you've hit your bid, every extra answer still earns 1 point. Don't stop typing." },
];

const HOST = [
  { Icon: Users, title: "Start when ready", body: "Start the game once everyone is in the lobby. People can't join after it begins." },
  { Icon: Eye, title: "Lock bids now", body: "Someone taking forever to bid? Lock the bids early and start the countdown." },
  { Icon: Clock, title: "Pace the night", body: "You choose when each next round starts, so there's always time for trash talk." },
  { Icon: Flag, title: "End early", body: "Wrap up anytime. Finished rounds keep their scores; the round in progress doesn't count." },
  { Icon: Repeat, title: "Play again", body: "One click starts a rematch with the same players and settings — everyone is moved over automatically." },
  { Icon: Smartphone, title: "See every answer", body: "After each round, open any player's list to see exactly what they typed and what counted." },
];

const FAQ = [
  {
    q: "What if I don't place a bid in time?",
    a: "You can still type answers for fun, but you score zero for that round. Bids lock when the bid timer ends or the host locks them early.",
  },
  {
    q: "Do wrong answers take points away?",
    a: "Never. Meet your bid and you get 2 points per answer up to it plus 1 for every extra; miss it and you score zero. Wrong answers and duplicates are simply ignored.",
  },
  {
    q: "Why didn't my answer count?",
    a: "Either it isn't on that topic's list, it's a duplicate of something you already named, or it's too far from any real answer for autocorrect to be sure. After each round you can see the full list of accepted answers.",
  },
  {
    q: "How many people can play?",
    a: "Two is enough, and it's at its best with 4–30. Everyone needs a phone or laptop with a browser.",
  },
  {
    q: "What happens if my connection drops?",
    a: "Just reopen the game link on the same device. Your seat, bid and answers are all saved, and the game keeps time on the server, so nobody loses seconds.",
  },
  {
    q: "What happens on a tie?",
    a: "Tied players share the same rank, on the leaderboard and on the final podium.",
  },
];

function SectionTitle({ eyebrow, title, tone = "text-cyan" }: { eyebrow: string; title: React.ReactNode; tone?: string }) {
  return (
    <Reveal className="mb-8">
      <p className={`text-xs font-bold uppercase tracking-[0.3em] ${tone}`}>{eyebrow}</p>
      <h2 className="mt-2 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{title}</h2>
    </Reveal>
  );
}

function CardGrid({ items, cols = "md:grid-cols-3" }: { items: { Icon: React.ElementType; title: string; body: string }[]; cols?: string }) {
  return (
    <div className={`grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 ${cols}`}>
      {items.map(({ Icon, title, body }, i) => (
        <Reveal key={title} delay={i * 0.05} className="panel min-w-0 p-5">
          <Icon className="size-6 text-volt" aria-hidden />
          <h3 className="mt-3 font-display text-2xl font-extrabold uppercase leading-none">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </Reveal>
      ))}
    </div>
  );
}

export default function HowToPlayPage() {
  return (
    <main className="relative">
      <Backdrop tone="uv" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="md" />
        <nav className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Link href="/join" className="rounded-lg px-3 py-2 hover:text-text">
            Join
          </Link>
          <Link href="/create" className="rounded-lg px-3 py-2 text-text hover:text-volt">
            Host
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">Two-minute guide</p>
          <h1 className="mt-3 font-display text-[clamp(4rem,13vw,10rem)] font-black uppercase leading-[0.8]">
            How to <span className="text-volt-glow">play</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            See the topic, bet on how many you can name, then name as many as you can before the clock runs out. Hit
            your number and every answer pays double. Fall one short and you get nothing.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-2">
          {[
            ["2–30 players", Users],
            ["~2 min per round", Clock],
            ["Phones or laptops", Smartphone],
            ["Nothing to install", ShieldCheck],
          ].map(([label, Icon]) => {
            const I = Icon as React.ElementType;
            return (
              <span key={label as string} className="flex items-center gap-2 rounded-full border border-line-strong bg-night/70 px-4 py-2 text-sm font-semibold">
                <I className="size-4 text-volt" aria-hidden />
                {label as string}
              </span>
            );
          })}
        </Reveal>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6" aria-labelledby="steps-title">
        <h2 id="steps-title" className="sr-only">
          Step by step
        </h2>
        <ol className="space-y-16 sm:space-y-24">
          {STEPS.map(({ title, body, tip, tone, Visual }, i) => (
            <li key={title} className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
              <Reveal className={i % 2 ? "min-w-0 md:order-2" : "min-w-0"}>
                <div className="flex items-baseline gap-4">
                  <span className={`font-display text-8xl font-black leading-none ${tone}`}>{i + 1}</span>
                  <span className="h-px flex-1 bg-line-strong" aria-hidden />
                </div>
                <h3 className="mt-2 font-display text-4xl font-black uppercase leading-[0.9] sm:text-5xl">{title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
                <p className="mt-4 rounded-2xl border border-line bg-night/60 px-4 py-3 text-sm text-text">
                  <span className="mr-2 font-bold uppercase tracking-wider text-volt">Tip</span>
                  {tip}
                </p>
              </Reveal>
              <Reveal delay={0.1} className={i % 2 ? "min-w-0 md:order-1" : "min-w-0"}>
                <Visual />
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Scoring */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <SectionTitle
          eyebrow="Scoring"
          tone="text-volt"
          title={
            <>
              One rule. <span className="text-volt-glow">No mercy.</span>
            </>
          }
        />
        <Reveal className="mb-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-volt/40 bg-volt/10 p-5">
            <p className="font-display text-3xl font-black uppercase text-volt">Hit your bid → 2 per answer</p>
            <p className="mt-1 text-sm text-muted-foreground">Bid 5, name 6 fruits: 5 × 2 + 1 extra = 11 points.</p>
          </div>
          <div className="rounded-3xl border border-hot/40 bg-hot/10 p-5">
            <p className="font-display text-3xl font-black uppercase text-hot">Miss by one → score zero</p>
            <p className="mt-1 text-sm text-muted-foreground">Bid 7, name 6 fruits: 0 points. Close doesn&apos;t count.</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <ScoringPlayground />
        </Reveal>
      </section>

      {/* Answers */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <SectionTitle eyebrow="Answers" title="What counts" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Reveal className="min-w-0">
            <AnswerChecker />
          </Reveal>
          <CardGrid items={RULES} cols="md:grid-cols-2 lg:grid-cols-2" />
        </div>
      </section>

      {/* Tips */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <SectionTitle eyebrow="Strategy" tone="text-uv-soft" title="Bid like a pro" />
        <CardGrid items={TIPS} cols="md:grid-cols-4" />
      </section>

      {/* Host */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <SectionTitle eyebrow="For the host" tone="text-amber" title="Running the room" />
        <CardGrid items={HOST} />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <SectionTitle eyebrow="FAQ" title="Quick answers" />
        <div className="space-y-2">
          {FAQ.map(({ q, a }, i) => (
            <Reveal key={q} delay={i * 0.04}>
              <details className="group panel p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-extrabold uppercase">
                  {q}
                  <span className="text-2xl text-volt transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal className="panel flex flex-col items-center gap-6 p-8 text-center sm:p-12">
          <Trophy className="size-12 text-amber" aria-hidden />
          <h2 className="font-display text-5xl font-black uppercase leading-[0.9] sm:text-7xl">
            Ready? <span className="text-volt-glow">Start a room.</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-2xl bg-volt px-8 font-display text-xl font-extrabold uppercase tracking-wide text-[#0a0d00] shadow-[0_6px_0_var(--volt-deep),0_14px_40px_rgb(200_255_46/0.25)] transition active:translate-y-1 active:shadow-[0_2px_0_var(--volt-deep)]"
            >
              Host a game
            </Link>
            <Link
              href="/join"
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-2xl border border-line-strong bg-deck/70 px-8 font-display text-xl font-extrabold uppercase tracking-wide shadow-[0_6px_0_#070a26] transition active:translate-y-1 active:shadow-[0_2px_0_#070a26]"
            >
              Join with a code
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="space-y-1 border-t border-line py-8 text-center text-sm text-faint">
        <p>ListOff · answers checked against a curated database — no AI guessing, no arguments.</p>
        <BuiltBy />
      </footer>
    </main>
  );
}
