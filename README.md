```markdown
# AI Bibliography App (MVP)

A tiny Next.js 14 demo that lets students paste their **LLM prompt + output** and returns a “Responsible Use” badge.

## Quick Start

```bash
pnpm install     # or npm i / yarn
pnpm dev         # http://localhost:3000
```

## Deploy to Vercel
1. Push this folder to GitHub.
2. "New Project" → select repo → framework = **Next.js**.
3. Click **Deploy** – done.

## Replace the Demo Evaluator
Edit **`lib/similarity.ts`** + **`app/api/evaluate/route.ts`** to call your real LLM chain / embedding service.
```

