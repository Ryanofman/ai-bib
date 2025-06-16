```ts
import { NextResponse } from "next/server";
import { cosineSimilarity } from "../../../../lib/similarity"; // simple helper

export const runtime = "edge"; // keeps cold‑start tiny on Vercel free tier

export async function POST(request: Request) {
  const { prompt, output } = await request.json();

  // 🔸 naive demo logic – replace with real evaluators later
  const sim = cosineSimilarity(prompt, output);
  const responsible = sim < 0.75;

  return NextResponse.json({
    responsible_use: responsible,
    scores: {
      similarity: +sim.toFixed(2),
      transformative_edit: +(1 - sim).toFixed(2),
      citation_present: /\b(http|doi|arxiv|\d{4})\b/i.test(output),
    },
    explanation: responsible
      ? "Sufficient divergence and citation detected."
      : "High similarity – possible over‑reliance on AI.",
    timestamp: new Date().toISOString(),
  });
}
```

