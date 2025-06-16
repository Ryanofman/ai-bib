export function cosineSimilarity(a: string, b: string): number {
  const tokensA = tokenCounts(a);
  const tokensB = tokenCounts(b);
  const vocab = new Set([...Object.keys(tokensA), ...Object.keys(tokensB)]);
  let dot = 0,
    magA = 0,
    magB = 0;
  vocab.forEach((t) => {
    const x = tokensA[t] ?? 0;
    const y = tokensB[t] ?? 0;
    dot += x * y;
    magA += x * x;
    magB += y * y;
  });
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}
function tokenCounts(s: string) {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc), {});
}



