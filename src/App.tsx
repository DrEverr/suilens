import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";
import { Search } from "./Search";
import { isValidTransactionDigest } from "@mysten/sui/utils";
import { useState } from "react";

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
          <WalletStatus />
          <Search onFound={(id) => {
            window.location.hash = id;
            setDigest(id);
          }} />
          {digest ? (<Text>
            Place holder for summary of digest: {digest}
          </Text>) :
            (
              <Heading>Search for transaction</Heading>
            )
          }
        </Container>
      </Container>
    </>
  );
}

export default App;
