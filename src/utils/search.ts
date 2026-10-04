import type { Product } from '@/types';

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function fuzzySearchProducts(products: Product[], query: string): Product[] {
  const q = normalize(query);
  if (!q) return [];

  return products
    .map(p => {
      const name = normalize(p.name);
      const category = normalize(p.category);
      let score = Infinity;

      if (name.includes(q)) score = 0;
      else if (category.includes(q)) score = 1;
      else {
        const words = name.split(' ');
        for (const w of words) {
          if (w.startsWith(q)) score = Math.min(score, 2);
          const dist = levenshtein(q, w);
          if (dist <= 2 && dist < score) score = dist + 2;
        }
        if (score === Infinity) {
          const dist = levenshtein(q, name);
          if (dist <= 3) score = dist + 5;
        }
      }

      return { product: p, score };
    })
    .filter(r => r.score < 10)
    .sort((a, b) => a.score - b.score)
    .map(r => r.product);
}
