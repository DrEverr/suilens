import { ConnectButton } from '@mysten/dapp-kit'
import { isValidTransactionDigest } from '@mysten/sui/utils'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Card, Container, Flex, Heading, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { ExampleDigests } from './Examples'
import { Search } from './Search'
import { TransactionAnalyzer } from './TransactionAnalyzer'

function App() {
  const [digest, setDigest] = useState<string | null>(null)

  // Auto-trigger analysis when page loads with valid digest in hash
  useEffect(() => {
    const hashDigest = window.location.hash.slice(1)
    if (isValidTransactionDigest(hashDigest)) {
      setDigest(hashDigest)
    }
  }, [])

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: '1px solid var(--gray-a2)',
        }}
      >
        <Box>
          <Heading
            style={{ cursor: 'pointer' }}
            onClick={() => {
              window.location.hash = ''
              setDigest(null)
            }}
          >
            SuiLens
          </Heading>
          <Text size="4" color="gray">
            Analyze Sui transactions in plain language
          </Text>
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
          style={{ background: 'var(--gray-a2)', minHeight: 500 }}
        >
          <Search
            initialDigest={digest}
            onFound={(id) => {
              window.location.hash = id
              setDigest(id)
            }}
          />
          {digest ? (
            <TransactionAnalyzer digest={digest} />
          ) : (
            <Flex direction="column" gap="4">
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
              <ExampleDigests
                onSelectDigest={(id) => {
                  window.location.hash = id
                  setDigest(id)
                }}
              />
            </Flex>
          )}
        </Container>
      </Container>
    </>
  )
}

export default App
