import { getFullnodeUrl, SuiClient, SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";

export type NetworkType = "mainnet" | "devnet" | "testnet";

export interface NetworkSearchResult {
  transaction: SuiTransactionBlockResponse;
  network: NetworkType;
}

export class MultiNetworkSuiClient {
  private clients: Map<NetworkType, SuiClient>;
  private readonly searchOrder: NetworkType[] = [
    "mainnet",
    "devnet",
    "testnet",
  ];

  constructor() {
    this.clients = new Map();

    // Initialize clients for all networks
    this.clients.set(
      "mainnet",
      new SuiClient({ url: getFullnodeUrl("mainnet") }),
    );
    this.clients.set(
      "devnet",
      new SuiClient({ url: getFullnodeUrl("devnet") }),
    );
    this.clients.set(
      "testnet",
      new SuiClient({ url: getFullnodeUrl("testnet") }),
    );
  }

  /**
   * Search for a transaction across all networks
   * Returns the first successful result found
   */
  async findTransaction(
    digest: string,
    options?: SuiTransactionBlockResponseOptions,
  ): Promise<NetworkSearchResult> {
    for (const network of this.searchOrder) {
      const client = this.clients.get(network);
      if (!client) {
        continue;
      }
      try {
        const transaction = await client.getTransactionBlock({
          digest,
          options: options || {
            showBalanceChanges: true,
            showEffects: true,
            showEvents: true,
            showInput: true,
            showObjectChanges: true,
          },
        });

        return {
          transaction,
          network,
        };
      } catch (error) {
        // Continue to next network
        continue;
      }
    }

    // If we get here, the transaction wasn't found on any network
    const errorMessage = `Transaction ${digest} not found on any network (${this.searchOrder.join(", ")})`;
    console.warn(errorMessage);
    throw new Error(errorMessage);
  }
}

// Export a singleton instance
export const multiNetworkClient = new MultiNetworkSuiClient();

// Helper function to get network display name with emoji
export function getNetworkDisplayName(network: NetworkType): string {
  switch (network) {
    case "mainnet":
      return "🌐 Mainnet";
    case "devnet":
      return "🔧 Devnet";
    case "testnet":
      return "🧪 Testnet";
    default:
      return (
        (network as string).charAt(0).toUpperCase() +
        (network as string).slice(1)
      );
  }
}

// Helper function to get network color for UI
export function getNetworkColor(network: NetworkType): "green" | "orange" | "blue" | "gray" {
  switch (network) {
    case "mainnet":
      return "green";
    case "devnet":
      return "orange";
    case "testnet":
      return "blue";
    default:
      return "gray";
  }
}
