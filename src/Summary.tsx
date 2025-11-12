import { SuiObjectChange, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { Badge, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { formatObjectType, getTransactionType } from "./utils";
import { getNetworkColor, getNetworkDisplayName, NetworkSearchResult, NetworkType } from "./multiNetwork";

export function Summary({ txn }: { txn: NetworkSearchResult }) {
  interface TransactionSummary {
    transaction: SuiTransactionBlockResponse;
    network: NetworkType;
    status: "success" | "failure";
    type: string;
    sender: string;
    epoch: string;
    actions: string[];
  }

  interface Transfer {
    objectId: string;
    objectType: string;
    from: string;
    to: string;
  }

  interface Publish {
    packageId: string,
    modules: string,
  }

  interface MoveCall {
    packageId: string,
    moduleName: string,
    functionName: string,
    arguments: string[],
  }

  const analizeTransaction = (result: NetworkSearchResult): TransactionSummary => {
    const { transaction: txn, network } = result;
    const status = txn.effects?.status.status === "success" ? "success" : "failure";

    let created = 0;
    let deleted = 0;
    let mutated = 0;
    let wrapped = 0;
    const transfers: Transfer[] = [];
    const publish: Publish[] = [];

    const changes: SuiObjectChange[] = txn.objectChanges || [];
    changes.forEach((change) => {
      switch (change.type) {
        case "created":
          created++;
          break;
        case "deleted":
          deleted++;
          break;
        case "mutated":
          mutated++;
          break;
        case "transferred":
          transfers.push({
            objectId: change.objectId,
            objectType: change.objectType,
            from: change.sender,
            to:
              (change.recipient as any).AddressOwner ||
              (change.recipient as any).ObjectOwner ||
              "Unknown",
          });
          break;
        case "published":
          publish.push({
            packageId: change.packageId,
            modules: change.modules.join(", "),
          });
          break;
        case "wrapped":
          wrapped++;
          break;
      }
    });

    const moveCalls: MoveCall[] = [];
    if (txn.transaction?.data.transaction.kind === "ProgrammableTransaction") {
      const commands = txn.transaction.data.transaction.transactions;
      commands.forEach((command: any) => {
        /** https://sdk.mystenlabs.com/typedoc/types/_mysten_sui.client.SuiTransaction.html */
        if (command.MoveCall) {
          /** https://sdk.mystenlabs.com/typedoc/interfaces/_mysten_sui.client.MoveCallSuiTransaction.html */
          moveCalls.push({
            packageId: command.MoveCall.package,
            moduleName: command.MoveCall.module,
            functionName: command.MoveCall.function,
            arguments: command.MoveCall.arguments || [],
          });
        }
      });
    }

    const humanReadableActions: string[] = [];

    // Summrized acctions
    if (created > 0) {
      humanReadableActions.push(
        `Created ${created} new object${created > 1 ? "s" : ""}`,
      );
    }
    if (deleted > 0) {
      humanReadableActions.push(
        `Deleted ${deleted} object${deleted > 1 ? "s" : ""}`,
      );
    }
    if (mutated > 0) {
      humanReadableActions.push(
        `Mutated ${mutated} object${mutated > 1 ? "s" : ""}`,
      );
    }
    if (wrapped > 0) {
      humanReadableActions.push(
        `Wrapped ${wrapped} object${wrapped > 1 ? "s" : ""}`,
      );
    }

    // Transfer acctions
    transfers.forEach((transfer) => {
      const objectType = formatObjectType(transfer.objectType);
      humanReadableActions.push(
        `Transferred ${objectType} from ${transfer.from} to ${transfer.to}`,
      );
    });

    const type = getTransactionType(
      moveCalls,
      transfers,
      created,
    );

    return {
      transaction: txn,
      network,
      status,
      type,
      sender: txn.transaction?.data.sender || "Unknown",
      epoch: txn.effects?.executedEpoch || "Unknown",
      actions: humanReadableActions,
    };
  }

  const summary = analizeTransaction(txn);

  return (
    <Grid columns={{ initial: "1", md: "2" }} gap="4" mb="6">
      <Card>
        <Flex direction="column" gap="4">
          <Flex align="center" gap="3">
            <Heading size="4">Transaction Status</Heading>
            <Badge color={summary.status === "success" ? "green" : "red"}>
              {summary.status === "success" ? (
                <CheckCircledIcon />
              ) : (
                <CrossCircledIcon />
              )}
              {summary.status.toUpperCase()}
            </Badge>
          </Flex>
          <Flex align="center" gap="2">
            <Text size="2" color="gray">
              Found on
            </Text>
            <Text color={getNetworkColor(summary.network)}>
              {getNetworkDisplayName(summary.network)}
            </Text>
          </Flex>
        </Flex>
      </Card>

      {summary.actions.length > 0 && (
        <Card mb="6">
          <Flex justify="between" align="center" mb="4">
            <Heading size="4">What Happened?</Heading>
            <Badge variant="soft" color="blue">
              {summary.type}
            </Badge>
          </Flex>
          <Flex direction="column" gap="2">
            {summary.actions.map((action, index) => (
              <Flex key={index} align="center" gap="2">
                <Text size="3">{action}</Text>
              </Flex>
            ))}
          </Flex>
        </Card>
      )}
    </Grid>
  );
}
