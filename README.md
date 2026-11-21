# ListOff

**How many can you name?** A real-time multiplayer party game for 2–30 people sharing one link.

Every round, the topic appears for the whole room, then each player secretly **bids** how many
answers they can name. Once bids lock, everyone races the clock (the length the host picked).
Hit your bid and every answer up to it is worth 2 points, plus 1 for each extra. Miss it by one
and you score nothing.

```
if (valid >= bid) points = 2 * bid + (valid - bid)   // bid 5, name 7 → 12; name 5 → 10
else              points = 0                         // bid 5, name 4 → 0
```

Answers are checked against a curated PostgreSQL knowledge base — **358 topics and ~33,500 answers**, of which 164 bounded topics (~9,300 answers) are dealt in games.
Open-ended topics (lakes, cities, rivers, actors…) are kept in the database but retired, because
nobody can check "any lake in the world". Spelling mistakes are autocorrected locally (edit
distance, sound-alike keys and unique partial names), and a real answer is never "corrected" into a
different one. No LLM or AI API is involved at any point.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPrajwal2006%2FListOff&project-name=listoff&repository-name=listoff&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%5D)

**One click:** the button clones the repo, creates a Neon Postgres database for it, and deploys.
The build migrates the database and loads the knowledge base automatically. No commands to run.

---

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router) · React 19 · TypeScript |
| UI | Tailwind CSS 4 · shadcn/ui (Radix) · Framer Motion · Lucide |
| Database | Neon PostgreSQL · Drizzle ORM (postgres.js driver) |
| Realtime | Server-authoritative state in Postgres + versioned polling (see below) |
| Tests | Vitest · PGlite (real Postgres in WASM) for integration tests |
| Hosting | Vercel (app) + Neon (database) |

## Quick start

```bash
npm install
npm run dev
```

With **no `DATABASE_URL`**, local dev automatically uses an embedded on-disk Postgres (PGlite in
`./.pglite`), migrates it and seeds the full knowledge base on first request (~10 s). Open
http://localhost:3000, host a game, then join from another browser/device with the code.

### Using Neon locally (optional)

1. Create a Neon project (https://console.neon.tech) and copy the **pooled** connection string
   (host contains `-pooler`) and the **direct** one.
2. `cp .env.example .env.local` and fill in `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct).
3. `npm run db:setup` — migrates and loads the knowledge base (safe to re-run), then `npm run dev`.

## Deploying to Vercel

### Option A — Deploy button (easiest)

Click **Deploy with Vercel** above. Vercel will:

1. copy the repo into your GitHub account,
2. ask you to add **Neon** (pick the free plan) — this sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`,
3. build and deploy. During the build, `scripts/prepare-db.ts` applies migrations and loads all
   358 topics (~5 s the first time, ~0.1 s on later deploys when the data hasn't changed).

Open `https://<your-app>.vercel.app/api/health` to confirm: it should report `"ok": true` and
the topic count.

### Option B — Import an existing repo

1. Vercel → **Add New → Project** → import the repo. Keep the defaults (Next.js, `npm run build`).
2. In the project: **Storage → Create Database → Neon**, connect it to all environments.
3. Deploy (or **Redeploy** if the first build ran before the database was attached).

If you deploy before attaching a database, the build stops with a message telling you exactly
what to click — it never ships a broken app.

### After deploying (optional)

- **Admin editor:** `/admin` is password-protected (analytics dashboard, answer appeals and the knowledge-base editor). Set `ADMIN_SECRET` to your own password; if unset, the built-in default is used, so change it before going public.
- **Solo mode + leaderboards (Neon Auth):** enable auth on your Neon branch (`neon neon-auth enable`),
  set `NEON_AUTH_BASE_URL` (printed by that command) and `NEON_AUTH_COOKIE_SECRET` (any random string of
  32+ characters, e.g. `openssl rand -base64 32`) in Vercel, and allow your site's origin with
  `neon neon-auth domain add https://<your-app>.vercel.app`. Without these, party games work and `/solo` says
  accounts aren't configured.
- **Custom domain:** add it in Vercel; invite links and QR codes use the domain players visit.
  Set `NEXT_PUBLIC_APP_URL` only if you want links to always point at one specific domain.
- **Preview deployments:** with Neon's Vercel integration, each preview gets its own database
  branch, and the build migrates and seeds it automatically.
- **Skipping the DB step:** set `SKIP_DB_PREPARE=1` if you manage migrations yourself.

In production the app refuses to run without a database — the embedded PGlite fallback is
local-development only.
## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `start` | Next.js |
| `npm run build` | Prepares the database (if configured) then `next build` — this is what Vercel runs |
| `npm run build:app` | `next build` only |
| `npm test` | Unit + integration tests (Vitest, PGlite) |
| `npm run typecheck` / `lint` | `tsc --noEmit` / ESLint |
| `npm run db:generate` | Generate a SQL migration after editing `src/lib/db/schema.ts` |
| `npm run db:setup` | Migrate + load the knowledge base if missing or out of date |
| `npm run db:migrate` | Apply migrations in `./drizzle` |
| `npm run db:seed` | Force a full knowledge-base upsert (idempotent) |
| `npm run data:stats` | Knowledge-base report: totals, duplicates, alias and loose-match collisions |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | prod | Neon **pooled** connection string used by the app (set by the Neon integration; `POSTGRES_URL` also accepted) |
| `DATABASE_URL_UNPOOLED` | recommended | Direct connection for migrations/seed (set by the Neon integration; `POSTGRES_URL_NON_POOLING` also accepted) |
| `ADMIN_SECRET` | recommended | Password for `/admin`; falls back to a built-in default if unset |
| `NEON_AUTH_BASE_URL` | for solo mode | Neon Auth endpoint for this branch (from `neon neon-auth enable`) |
| `NEON_AUTH_COOKIE_SECRET` | for solo mode | 32+ random characters used to sign session cookies |
| `NEXT_PUBLIC_APP_URL` | optional | Public base URL for invite links |
| `DB_POOL_MAX` | optional | postgres.js pool size per instance (default 5) |
| `SKIP_DB_PREPARE` | optional | `1` skips the build-time migrate/seed step |

---

## Solo mode and leaderboards

Signed-in players (email + password via Neon Auth, managed Better Auth) can play solo rounds on random
topics: see the topic, bid, then 30 seconds on the server clock. Each round is scored exactly once
(conditional `ANSWERING → COMPLETE` update in the same transaction as the profile total) and the
points add to the player's account. Players pick their country (India or the US), state and
university (281 seeded, players can add missing ones), and rank on national, state and university
leaderboards (`/leaderboards`). Identity always comes from the session cookie, never the request body.

## How it works

### Game flow (server-authoritative state machine)

```
LOBBY ─start─▶ PREDICTION ─all bid / deadline / host─▶ TOPIC_REVEAL ─4.5s─▶ ANSWERING
                   ▲                                                         │ deadline
                   │ next round                                              ▼
            ROUND_LEADERBOARD ◀────────── ROUND_PROCESSING (tally, one transaction)
                   │ last round
                   ▼
             GAME_FINISHED ─play again─▶ new LOBBY (same players, linked)
```

- The topic is chosen when the round is created and shown to everyone while they bid. Bids stay
  hidden (even from the host) until they lock.
- Every timestamp (`prediction_deadline`, `answering_starts_at`, `answering_deadline`) is written
  by the server. Clients only *display* countdowns, aligned to server time via each poll's
  `serverNow`.
- Time-based transitions are applied lazily by whichever request arrives first (every poll,
  prediction and answer call runs `advanceGame`). Each transition is a **conditional `UPDATE … WHERE
  current_state = …`**, so concurrent callers can't apply it twice. No background workers, cron
  jobs or in-memory state.

### Realtime on serverless

Vercel functions are short-lived, so a socket server isn't an option without extra infrastructure.
ListOff keeps **all state in Postgres** and syncs clients with **versioned polling**
(`src/lib/realtime/use-game-sync.ts`):

- Every mutation bumps `games.state_version`. Clients poll `GET /api/games/:code/state?v=N` every
  700 ms during live phases (1.5 s otherwise, 4 s in a hidden tab). If nothing changed the server
  replies with a ~60-byte `{ unchanged: true, serverNow }`.
- Each poll is also the player's heartbeat (throttled to one write per 4 s) and drives
  connected/disconnected indicators and the "everyone has bid" check.
- After any action, the client re-polls immediately, so transitions feel instant.

The transport is isolated in one hook, so swapping in push (e.g. Neon Realtime, Pusher/Ably, or a
Socket.IO server) later doesn't touch game logic.

### Integrity

- **Exactly-once scoring.** The tally claims the round with a conditional update, inserts
  `round_scores` with a unique `(round, participant)` key, and recomputes totals from
  `round_scores` — never `total += x`.
- **No late answers.** Answer inserts read the round row `FOR SHARE` inside a transaction; the
  tally's row lock waits for in-flight inserts, and anything after the claim is rejected. The
  window is `answering_deadline + 750 ms` network grace, and tallying starts 1.5 s after the deadline.
- **Duplicates.** A canonical answer is credited once per player per round, enforced by a partial
  unique index — even across aliases and concurrent requests.
- **Predictions** are insert-once (unique `(round, participant)`), integers 1–50, only during
  PREDICTION.
- **Tokens.** 256-bit random host/player tokens; only SHA-256 hashes are stored; compared in
  constant time. Game codes use an unambiguous alphabet from `crypto.randomInt`.
- Input caps (60-char answers, 100 answers/round, 20-char names, 16 KB bodies), per-instance rate
  limits, membership checks on every request, and no tokens/hashes in any response.
- Late joiners can't enter a started game; players with an existing token always reconnect.

### Answer validation

`src/lib/validation/` — shared by the browser (instant duplicate feedback) and the server
(authoritative verdict):

1. **Normalize**: lowercase, strip accents/ligatures, `&→and`, `+→plus`, `#→sharp`, join
   apostrophes, punctuation → spaces, collapse whitespace, drop a leading "the".
2. **Exact match** against the canonical answer and aliases (plus safe St./Saint, Mt./Mount variants).
3. **Singular** retry (`grapes → grape`, `cherries → cherry`).
4. **Loose keys** (spaces removed, singularized) — used only when they map to exactly one answer.

There is deliberately **no fuzzy/edit-distance matching**: spelling variants are curated aliases.

### Knowledge base

`src/data/seed/*.ts` holds the curated data in a compact format:

```ts
answers: `United States=USA=US=America | United Kingdom=UK=Britain | France`
```

The first name is canonical; `=` adds aliases. Country/capital topics are derived from one tagged
master table so continent, EU, NATO, landlocked and island lists stay consistent. The seeder
(`npm run db:seed`) upserts on slugs and normalized keys, so it's idempotent and never clobbers
answers added through `/admin`. See `src/data/seed/SOURCES.md` for sourcing notes.

`/admin` (password from `ADMIN_SECRET`) shows usage analytics and player answer appeals, and lets you search topics, create topics, bulk-add answers and
aliases in the same format, and disable bad answers or whole topics.

## Project layout

```
src/
  app/                 pages (/, /create, /join, /game/[code], /dashboard, /admin) + API routes
  components/
    brand/             logo (tally glyph), stage backdrop
    game/              avatars, tally marks, countdown ring, stepper, phase screens
    leaderboard/       animated leaderboard
    landing/           self-playing hero demo, join form
    moderator/         share card + QR, settings, host round views
  lib/
    db/                schema, Neon/PGlite clients
    game-engine/       pure state machine + timing rules
    validation/        normalization + topic index
    scoring/           the scoring rule + ranking
    realtime/          sync hook, server-aligned countdowns
    seed/              seed format, parser, idempotent seeder
  server/              game, participant, round, scoring, snapshot, admin services
  data/seed/           curated knowledge base (36 categories)
  types/               shared client/server types
scripts/               migrate, seed, data-stats
tests/                 unit + PGlite integration tests
drizzle/               SQL migrations
```

## Tests

`npm test` runs the suite on in-memory PGlite. Set `TEST_DATABASE_URL` to run the game-flow suite
over the production postgres.js driver against a real Postgres (e.g. a throwaway Neon branch).
The tests cover: normalization, alias matching, duplicate detection, invalid answers,
the exact scoring examples (bid 5/got 6 → 11, bid 5/got 5 → 10, bid 7/got 6 → 0), prediction locking, state
transitions, timer expiry, early/late submission rejection, many players submitting at once,
exactly-once tallying under concurrent triggers, reconnection after refresh, rematches, autocorrect (typos, sound-alikes, partials,
ties, known-answer guard), snapshot secrecy (no bids before lock, no tokens), and seed idempotency + dataset size.
