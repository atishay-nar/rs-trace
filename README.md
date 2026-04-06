# rs-trace

Track papers as you do research. Organize them into projects, score them for relevance, and get suggestions for related work.

## What it does

- **Add papers** by DOI, arXiv ID, or URL — metadata is fetched automatically from CrossRef and arXiv
- **Relevance scoring** — papers are scored against your project description using OpenAI embeddings and sorted by relevance; every paper gets a blurb explaining why it's relevant
- **Sort** — toggle between sorting by relevance or by date added
- **Suggestions** — recommends related papers via Semantic Scholar, available once you have at least one high-relevance paper

## Stack

- Next.js 16 (App Router)
- PostgreSQL via [Neon](https://neon.tech) + Prisma
- OpenAI API (embeddings + GPT-4o mini for blurbs)
- Semantic Scholar API (recommendations)

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — Neon PostgreSQL pooled connection string (see [console.neon.tech](https://console.neon.tech))
   - `OPENAI_API_KEY` — needed for relevance scoring and blurbs; papers still load without it, they just won't be scored

3. Push the database schema:
   ```bash
   npx prisma db push
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Deploying

Works on Vercel out of the box. Set the same env vars in your project settings — the build step runs `prisma generate && prisma db push` automatically.
