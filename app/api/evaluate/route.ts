import { NextResponse } from "next/server";
import { cosineSimilarity } from "@/lib/similarity";

export const runtime = "edge";

export async function POST(request: Request) {
  const { prompt, output } = await request.json();
  const sim = cosineSimilarity(prompt, output);
  const responsible = sim < 0.75;
  return NextResponse.json({
    responsible_use: responsible,
    scores: {
      similarity: Number(sim.toFixed(2)),
      transformative_edit: Number((1 - sim).toFixed(2)),
      citation_present: /\b(http|doi|arxiv|\d{4})\b/i.test(output)
    },
    explanation: responsible
      ? "Sufficient divergence and citation detected"
      : "High similarity – student may have over‑relied on AI",
    timestamp: new Date().toISOString()
  });
}
