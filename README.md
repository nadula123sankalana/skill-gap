# Internship Skill Gap Assessment & Recommendation System

Production-quality Next.js app for assessing student internship readiness against admin-configurable industry benchmarks.

## Stack

- Next.js 14 (App Router) + TypeScript
- **MongoDB Atlas** via the official `mongodb` Node.js driver (no Prisma)
- NextAuth.js (Credentials) — roles: `STUDENT`, `ADMIN`
- Tailwind CSS + custom design tokens (`DESIGN.md`)
- Recharts for gap charts
- Google Gemini (`gemini-2.5-flash`) for personalized text + cohort free-text insights

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
| `GEMINI_API_KEY` | Optional — AI Studio key; app works without it |

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
- Rule-based recommendations + Gemini personalization (graceful fallback)
- Admin CRUD for skills, benchmarks, rules, severity
- Cohort dashboard with averages, RED rankings, free-text insights, student drill-down

## Vercel deployment

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL, e.g. `https://your-app.vercel.app`)
   - `GEMINI_API_KEY` (optional)
4. Deploy
5. In MongoDB Atlas → Network Access, allow Vercel IPs (or `0.0.0.0/0` for demos)
6. Smoke-test: register student → assessment → gaps → admin cohort

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run db:seed` | Reset & seed MongoDB starter data |
| `npm run db:indexes` | Ensure collection indexes |
