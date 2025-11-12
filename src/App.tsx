import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Card, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { Search } from "./Search";
import { isValidTransactionDigest } from "@mysten/sui/utils";
import { useState } from "react";
import { TransactionAnalyzer } from "./TransactionAnalyzer";
import { InfoCircledIcon } from "@radix-ui/react-icons";

function App() {
  const [digest, setDigest] = useState(() => {
    const digest = window.location.hash.slice(1);
    return isValidTransactionDigest(digest) ? digest : null;
  });

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>dApp Starter Template</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          <Search onFound={(id) => {
            window.location.hash = id;
            setDigest(id);
          }} />
          {digest ? (
            <TransactionAnalyzer digest={digest} />
          ) :
            (
              <Card>
                <Flex direction="column" align="center" gap="4" py="8">
                  <InfoCircledIcon width="48" height="48" color="gray" />
                  <Text size="4" color="gray" align="center">
                    Enter a transaction digest above to get started
                  </Text>
                  <Text size="2" color="gray" align="center">
                    You can paste a digest directly or a full Sui Explorer URL
                  </Text>
                </Flex>
              </Card>
            )
          }
        </Container>
      </Container>
    </>
  );
}

export default App;
