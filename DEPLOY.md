# Deploy to Vercel

1. **Create a Neon database** – [console.neon.tech](https://console.neon.tech) → New Project → Copy the **Pooled connection** string.

2. **Deploy** – Connect your repo to Vercel and deploy.

3. **Add env vars** – Vercel → Settings → Environment Variables:
   - `DATABASE_URL` = your Neon connection string (add `&connection_limit=1` at the end)
   - `OPENAI_API_KEY` = your OpenAI key

4. **Redeploy** – So the env vars are picked up. Tables are created automatically during build.
