# Internship Skill Gap Assessment & Recommendation System

Production-quality Next.js app for assessing student internship readiness against admin-configurable industry benchmarks.

## Stack

- Next.js 14 (App Router) + TypeScript
- **MongoDB Atlas** via the official `mongodb` Node.js driver (no Prisma)
- NextAuth.js (Credentials) — roles: `STUDENT`, `ADMIN`
- Tailwind CSS + custom design tokens (`DESIGN.md`)
- Recharts for gap charts
- Rule-based skill library guidance (no generative AI)

## Setup

```bash
git clone <repo-url>
cd <repo>
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB Atlas URI (include database name, e.g. `/skill-gap`) |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` locally |

```bash
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seeded admin

- Email: `admin@university.edu`
- Password: `Admin123!`

### Role routing

- Students → `/dashboard/*` (admins redirected away)
- Admins → `/admin/*` (students redirected away)
- Logged out → `/login`

## Features

- Student registration, assessment (draft/submit), skip-safe scoring
- Gap analysis with live severity thresholds (RED / YELLOW / GREEN)
- Rule-based recommendations + template focus plans from the skill library
- Admin CRUD for skills, benchmarks, rules, severity
- Cohort dashboard with averages, RED rankings, free-text keyword insights, student drill-down

## Vercel deployment

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` — MongoDB Atlas URI (include DB name, e.g. `/skill-gap`)
   - `NEXTAUTH_SECRET` — long random string (`openssl rand -base64 32`) — **required or the site 500s**
   - `NEXTAUTH_URL` — production URL, e.g. `https://skill-gap-two.vercel.app`
4. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (or Vercel IPs)
5. Deploy, then run seed against Atlas if collections are empty (`npm run db:seed` locally with the same `DATABASE_URL`)
6. Smoke-test: home → register → assessment → admin login

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run db:seed` | Reset & seed MongoDB starter data |
| `npm run db:indexes` | Ensure collection indexes |
