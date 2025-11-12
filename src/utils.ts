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

export function formatObjectType(objectType: string): string {
  const parts = objectType.split("::");
  if (parts.length >= 2) {
    const moduleName = parts[parts.length - 2];
    const typeName = parts[parts.length - 1];

    if (parts.length === 3) {
      return `${moduleName}::${typeName}`;
    }
    return typeName;
  }
  return objectType;
}

export function getTransactionType(
  moveCalls: Array<{
    moduleName: string;
    functionName: string;
    packageId: string;
  }>,
  transfers: Array<{ objectType: string }>,
  created: number,
): string {
  // Check for common patterns
  const hasTransfers = transfers.length > 0;
  const hasCalls = moveCalls.length > 0;
  const hasCreation = created > 0;

  // Check for DEX/swap patterns
  const swapKeywords = ["swap", "exchange", "trade"];
  const hasSwap = moveCalls.some((call) =>
    swapKeywords.some(
      (keyword) =>
        call.functionName.toLowerCase().includes(keyword) ||
        call.moduleName.toLowerCase().includes(keyword),
    ),
  );

  // Check for mint patterns
  const mintKeywords = ["mint", "create"];
  const hasMint =
    moveCalls.some((call) =>
      mintKeywords.some((keyword) =>
        call.functionName.toLowerCase().includes(keyword),
      ),
    ) || hasCreation;

  // Check for NFT patterns
  const nftKeywords = ["nft", "collectible", "token"];
  const hasNFT = transfers.some((obj) =>
    nftKeywords.some((keyword) =>
      obj.objectType.toLowerCase().includes(keyword),
    ),
  );

  if (hasSwap) return "Token Swap";
  if (hasNFT && hasTransfers) return "NFT Transfer";
  if (hasMint) return "Token/Object Minting";
  if (hasTransfers) return "Asset Transfer";
  if (hasCalls) return "Smart Contract Interaction";
  if (hasCreation) return "Object Creation";

  return "Generic Transaction";
}

