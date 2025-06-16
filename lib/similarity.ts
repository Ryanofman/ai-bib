export function cosineSimilarity(a: string, b: string): number {
  const counts = (s: string) =>
    s.toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .reduce<Record<string, number>>((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});
  const A = counts(a);
  const B = counts(b);
  const vocab = new Set([...Object.keys(A), ...Object.keys(B)]);
  let dot = 0,
    magA = 0,
    magB = 0;
  vocab.forEach(t => {
    const x = A[t] || 0;
    const y = B[t] || 0;
    dot += x * y;
    magA += x * x;
    magB += y * y;
  });
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}
