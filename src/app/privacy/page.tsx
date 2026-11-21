import Link from "next/link";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Privacy policy",
  description: "What ListOff collects, why, and the choices you have.",
};

const UPDATED = "21 November 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-3xl font-extrabold uppercase">{title}</h2>
      <div className="space-y-2 text-muted-foreground [&_b]:text-text [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="relative min-h-dvh">
      <Backdrop />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="sm" />
        <Link href="/" className="text-sm text-muted-foreground hover:text-text">
          Back to the game
        </Link>
      </header>

      <article className="mx-auto max-w-3xl space-y-8 px-4 pb-16 sm:px-6">
        <div>
          <h1 className="font-display text-5xl font-black uppercase sm:text-6xl">Privacy policy</h1>
          <p className="mt-1 text-sm text-faint">Last updated {UPDATED}</p>
          <p className="mt-4 text-muted-foreground">
            ListOff is a small party game. We collect as little as we can to run it, we don&apos;t sell your data, and we don&apos;t show ads.
            This page explains what is stored and why.
          </p>
        </div>

        <Section title="What we collect">
          <ul>
            <li>
              <b>Multiplayer games:</b> the display name you type, your avatar, your bids, the answers you enter and your scores. You don&apos;t need
              an account to play.
            </li>
            <li>
              <b>Solo accounts (optional):</b> your email address, name, password or sign-in details (handled by our authentication provider, Neon
              Auth), plus the display name, country, state and university you choose, and your points and round history for the leaderboards.
            </li>
            <li>
              <b>Appeals:</b> if you appeal an answer, we store the text you appealed and the topic it was for. Appeals are not linked to your name or
              account.
            </li>
            <li>
              <b>Anonymous usage statistics:</b> which pages are viewed, whether the device is a phone, tablet or computer, the website that referred
              you (domain only), and a random ID generated in your browser so we can count unique visitors. We do not store your IP address or
              your browser&apos;s user-agent string in this data.
            </li>
          </ul>
        </Section>

        <Section title="How we use it">
          <ul>
            <li>To run games, score rounds and show leaderboards.</li>
            <li>To understand how the game is used, which topics are popular or too hard, and what to improve.</li>
            <li>To review appeals and add missing answers to topics.</li>
            <li>To keep the service secure and prevent abuse (for example, brief per-IP rate limiting, which is not stored long-term).</li>
          </ul>
          <p>We do not use your data for advertising, and we do not sell or rent it.</p>
        </Section>

        <Section title="Cookies and local storage">
          <p>
            ListOff stores small items in your browser so it works: a session token that keeps you in a multiplayer game, a sign-in session if you
            use a solo account, and the random anonymous ID used for visitor counts. We don&apos;t use advertising or cross-site tracking cookies.
          </p>
          <p>
            If your browser sends <b>Do Not Track</b> or <b>Global Privacy Control</b>, we don&apos;t record page views for you. You can also clear the
            site&apos;s storage at any time to reset your anonymous ID.
          </p>
        </Section>

        <Section title="Who we share it with">
          <p>
            Only the service providers needed to run ListOff: our hosting provider and our database/authentication provider (Neon). They process
            data on our behalf. Your display name, score, state and university appear on public leaderboards if you play solo. Within a multiplayer
            game, other players and the host can see your display name, bids and answers.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Multiplayer games and anonymous usage data are kept only as long as they are useful for running and improving the game. Solo accounts
            and their history are kept until you ask us to delete them.
          </p>
        </Section>

        <Section title="Your choices">
          <ul>
            <li>Play multiplayer without an account, using any display name you like (please don&apos;t use your real name if you&apos;d rather not).</li>
            <li>Ask us to access, correct or delete your account and solo history.</li>
            <li>Turn on Do Not Track / Global Privacy Control, or clear your browser storage, to opt out of anonymous usage counting.</li>
          </ul>
          <p>
            To make a request, contact the developer using the details in the &ldquo;Built by&rdquo; section on the{" "}
            <Link href="/" className="font-semibold text-cyan hover:underline">
              home page
            </Link>
            .
          </p>
        </Section>

        <Section title="Children">
          <p>ListOff isn&apos;t directed at children under 13, and we don&apos;t knowingly collect their personal information.</p>
        </Section>

        <Section title="Changes">
          <p>If we change this policy we&apos;ll update the date above. Continued use of ListOff after a change means you accept the updated policy.</p>
        </Section>
      </article>
    </main>
  );
}
