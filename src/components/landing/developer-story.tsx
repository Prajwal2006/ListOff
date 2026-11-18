import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Briefcase, Globe } from "lucide-react";
import { TallyGlyph } from "@/components/brand/logo";
import { DEVELOPER, IDEA_BY } from "@/lib/developer";

function ExternalLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-line-strong bg-deck/70 px-5 font-display text-lg font-extrabold uppercase tracking-wide text-text shadow-[0_5px_0_#070a26] transition hover:bg-deck-2 active:translate-y-1 active:shadow-[0_1px_0_#070a26] sm:flex-none"
    >
      {children}
    </a>
  );
}

/** "The story behind it" — who made ListOff and why. Linked from the footer credit (#story). */
export function DeveloperStory() {
  return (
    <section id="story" aria-labelledby="story-title" className="mx-auto max-w-6xl scroll-mt-8 px-4 pb-20 sm:px-6">
      <h2 id="story-title" className="mb-6 font-display text-4xl font-black uppercase sm:text-5xl">
        The story behind it
      </h2>

      <div className="panel grid overflow-hidden md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative aspect-[4/5] w-full md:aspect-auto md:min-h-[520px]">
          <Image
            src={DEVELOPER.photo}
            alt={`${DEVELOPER.name}, the developer of ListOff, smiling in sunglasses while standing in the sea`}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
            style={{ objectPosition: "50% 30%" }}
          />
          {/* Fade the photo into the card on the side that meets the text. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-night/70"
          />
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-cyan">
            Hi, I&apos;m {DEVELOPER.name} <span aria-hidden>👋</span>
          </p>
          <h3 className="font-display text-4xl font-black uppercase leading-[0.9] sm:text-5xl">
            Everyone thinks they can name <span className="text-volt-glow">twenty fruits</span>
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            …right up until a clock starts ticking. My friend {IDEA_BY.firstName} came up with a game built entirely
            around that gap between how confident we are and what we can actually pull out of our heads under
            pressure.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            So I built ListOff. You bid on yourself before you see the topic, then race twenty seconds to back it up.
            No accounts, no app to download: just one link, a room full of friends, and a healthy amount of trash
            talk. Every answer is checked against a hand-built list of over 30,000, so the only arguments left are
            about who bid too high.
          </p>
          <p className="flex items-center gap-2 leading-relaxed text-text">
            <TallyGlyph className="size-6 shrink-0 text-text" />
            If it makes your next game night a little louder, it was worth building.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <ExternalLink href={DEVELOPER.linkedin} label={`${DEVELOPER.name} on LinkedIn`}>
              <Briefcase className="size-5" aria-hidden /> LinkedIn
            </ExternalLink>
            <ExternalLink href={DEVELOPER.portfolio} label={`${DEVELOPER.name}'s portfolio website`}>
              <Globe className="size-5" aria-hidden /> Portfolio
            </ExternalLink>
          </div>
        </div>
      </div>

      {/* The friend behind the idea */}
      <div className="panel mt-4 grid overflow-hidden sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-auto sm:min-h-[380px] md:min-h-[440px]">
          <Image
            src={IDEA_BY.photo}
            alt={`${IDEA_BY.name}, who came up with the idea for ListOff, smiling in a white shirt beside a marina with a palm tree`}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="scale-[1.25] object-cover"
            style={{ objectPosition: "48% 50%", transformOrigin: "48% 48%" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-night/70"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-amber">
            <span aria-hidden>💡</span> The idea
          </p>
          <h3 className="font-display text-4xl font-black uppercase leading-[0.9] sm:text-5xl">
            Dreamed up by <span className="text-uv-glow">{IDEA_BY.name}</span>
          </h3>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {IDEA_BY.firstName} is my friend and the one who came up with the idea for this game: bet on yourself
            before you know the topic, then try to back it up against the clock. I just turned it into something you
            can play.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Footer credit that jumps to the story section. */
export function BuiltBy({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      Made with <span aria-hidden>⚡</span>
      <span className="sr-only">love</span> by{" "}
      <Link href="/#story" className="font-bold text-text underline decoration-volt underline-offset-4 hover:text-volt">
        {DEVELOPER.name}
      </Link>
    </p>
  );
}
