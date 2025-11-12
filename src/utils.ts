export function extractDigestFromUrl(url: string): string | null {
  // Sui Explorer patterns
  const patterns = [
    /suivision\.xyz\/[^/]*txblock\/([A-Za-z0-9]+)/,
    /suiscan\.xyz\/[^/]*\/tx\/([A-Za-z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
