import { SuiObjectChange, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { Badge, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { formatObjectType, formatSuiAmount, getTransactionType, printActionCountName, shortenAddress } from "./utils";
import { getNetworkColor, getNetworkDisplayName, NetworkSearchResult, NetworkType } from "./multiNetwork";

export function Summary({ txn }: { txn: NetworkSearchResult }) {
  interface TransactionSummary {
    transaction: SuiTransactionBlockResponse;
    network: NetworkType;
    digest: string;
    status: "success" | "failure";
    gas: {
      budget: number;
      used: number;
      computation: number;
      storage: number;
      nonRefund: number;
      storageRebate: number;
      price: number;
    };
    type: string;
    sender: string;
    epoch: string;
    actions: string[];
    objects: {
      created: number;
      mutated: number;
      deleted: number;
    };
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

    const digest = txn.digest;

    // Transaction status info
    const status = txn.effects?.status.status === "success" ? "success" : "failure";

    // Gas info
    const gasBudget = formatSuiAmount(txn.transaction?.data.gasData.budget ?? 0);
    const gasPrice = formatSuiAmount(txn.transaction?.data.gasData.price ?? 0);
    const gasComputation = formatSuiAmount(txn.effects?.gasUsed.computationCost ?? 0);
    const gasStorage = formatSuiAmount(txn.effects?.gasUsed.storageCost ?? 0);
    const gasNonRefund = formatSuiAmount(txn.effects?.gasUsed.nonRefundableStorageFee ?? 0);
    const gasRebate = formatSuiAmount(txn.effects?.gasUsed.storageRebate ?? 0);
    const gasTotal = gasComputation + gasStorage - gasRebate - gasPrice;

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

    // Extracting only what was called from smart contracts
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

    // Generate human readable explanation of what's happening in transaction
    const humanReadableActions: string[] = [];

    // Transfer acctions
    if (transfers.length > 0) {
      humanReadableActions.push(printActionCountName("Transferred", transfers.length));
      transfers.forEach((transfer) => {
        const objectType = formatObjectType(transfer.objectType);
        humanReadableActions.push(
          `- Transferred ${objectType} from ${transfer.from} to ${transfer.to}`,
        );
      });
    }

    // Calls
    if (moveCalls.length > 0) {
      humanReadableActions.push(printActionCountName("Executed", moveCalls.length, "move call"));
      moveCalls.forEach((call) => {
        humanReadableActions.push(
          `- Called ${call.moduleName}::${call.functionName}()`,
        );
      });

    }

    // Describe what's the overall purpose of this transaction, and assign one general category
    const type = getTransactionType(
      moveCalls,
      transfers,
      created,
    );

    return {
      transaction: txn,
      digest,
      gas: {
        budget: gasBudget,
        used: gasTotal,
        price: gasPrice,
        computation: gasComputation,
        nonRefund: gasNonRefund,
        storage: gasStorage,
        storageRebate: gasRebate,
      },
      network,
      status,
      type,
      sender: txn.transaction?.data.sender || "Unknown",
      epoch: txn.effects?.executedEpoch || "Unknown",
      actions: humanReadableActions,
      objects: {
        created,
        mutated,
        deleted,
      },
    };
  }

  const summary = analizeTransaction(txn);

  return (
    <Container size="4" p="4">
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
            <Flex direction="column" gap="2">
              <Text size="3" color="gray">
                Digest
              </Text>
              <Text size="4">
                {summary.digest}
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Text size="3" color="gray">
                Found on
              </Text>
              <Text size="5" color={getNetworkColor(summary.network)}>
                {getNetworkDisplayName(summary.network)}
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Text size="3" color="gray">
                Sender
              </Text>
              <Text size="5">
                {shortenAddress(summary.sender)}
              </Text>
            </Flex>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">Object Changes</Heading>
            <Grid columns="3" gap="2">
              <Flex direction="column" gap="3">
                <Text size="3" color="gray">
                  Created
                </Text>
                <Text size="4" weight="bold" color="green">
                  {summary.objects.created}
                </Text>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="3" color="gray">
                  Modified
                </Text>
                <Text size="4" weight="bold" color="blue">
                  {summary.objects.mutated}
                </Text>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="3" color="gray">
                  Deleted
                </Text>
                <Text size="4" weight="bold" color="red">
                  {summary.objects.deleted}
                </Text>
              </Flex>
            </Grid>
            <Heading size="4">Gas used</Heading>
            <Text size="5" weight="bold" color="blue">
              {summary.gas.used.toFixed(6)}
            </Text>
            <Grid columns="5" gap="1">
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Gas price
                </Text>
                <Text size="4" weight="bold" color="red">
                  {summary.gas.price.toExponential(3)}
                </Text>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Computation
                </Text>
                <Text size="4" weight="bold" color="red">
                  {summary.gas.computation.toExponential(3)}
                </Text>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Storage
                </Text>
                <Text size="4" weight="bold" color="red">
                  {summary.gas.storage.toExponential(3)}
                </Text>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Non-refund
                </Text>
                <Text size="4" weight="bold" color="red">
                  {summary.gas.nonRefund.toExponential(3)}
                </Text>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Rebate
                </Text>
                <Text size="4" weight="bold" color="green">
                  {summary.gas.storageRebate.toExponential(3)}
                </Text>
              </Flex>
            </Grid>
          </Flex>
        </Card>
      </Grid>

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
    </Container>
  );
}
