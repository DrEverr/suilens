import { CopyIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import type { NetworkType } from './multiNetwork'

interface ExampleDigest {
  digest: string
  description: string
  network: NetworkType
  features?: string[]
}

const EXAMPLE_DIGESTS: ExampleDigest[] = [
  {
    digest: 'DmVJ3GC8qRpGEkfvTT2T642V95kgFHDeCk2agbpx98w8',
    description: 'Multi-Network Transaction',
    network: 'mainnet',
    features: ['Cross-network search', 'Gas optimization'],
  },
  {
    digest: '4epaeL3kiHkT7sukmBDguao5bKqptHnMtKy8vgpCFteo',
    description: 'Increment',
    network: 'devnet',
    features: ['Move calls', 'Modified state'],
  },
  {
    digest: 'Gag9pRDipKySckhMpeMdM5FSg4wGhpBy4AzdEDigZ1y2',
    description: 'DeFi Token Send',
    network: 'testnet',
    features: ['Move calls', 'Object transfers'],
  },
  {
    digest: '4eUy2vzkCUxhtp7JCxAZVnDuzPvVqkjC42A4eevKCCdV',
    description: 'Mint gUSD',
    network: 'testnet',
    features: ['Minting'],
  },
  {
    digest: 'FN9ece3HzkSSuBFAbn96wuuw55fKrAMqEsyrLZbwZV5G',
    description: 'Failed Smart Contract',
    network: 'mainnet',
    features: ['Multiple modules', 'Failed'],
  },
]

interface ExampleDigestsProps {
  onSelectDigest: (digest: string) => void
}

export function ExampleDigests({ onSelectDigest }: ExampleDigestsProps) {
  const handleCopy = async (digest: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(digest)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card mb="6">
      <Flex direction="column" gap="4">
        <Heading size="4">Try These Examples</Heading>
        <Text size="2" color="gray">
          Click any digest below to analyze it, or copy it to your clipboard
        </Text>

        <Flex direction="column" gap="3">
          {EXAMPLE_DIGESTS.map((example, _index) => (
            <Card key={example.digest} variant="surface">
              <Flex justify="between" align="center" gap="3">
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="2" mb="1">
                    <Text size="3" weight="medium">
                      {example.description}
                    </Text>
                    <Badge
                      variant="soft"
                      color={
                        example.network === 'mainnet'
                          ? 'green'
                          : example.network === 'devnet'
                            ? 'orange'
                            : 'blue'
                      }
                    >
                      {example.network}
                    </Badge>
                  </Flex>
                  <Text
                    size="1"
                    color="gray"
                    style={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                    }}
                  >
                    {example.digest}
                  </Text>
                  {example.features && (
                    <Flex gap="1" wrap="wrap" mt="1">
                      {example.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          size="1"
                          color="gray"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </Box>

                <Flex gap="2">
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={(e) => handleCopy(example.digest, e)}
                  >
                    <CopyIcon />
                  </Button>
                  <Button
                    variant="soft"
                    size="1"
                    onClick={() => onSelectDigest(example.digest)}
                  >
                    Analyze
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
          💡 These examples demonstrate cross-network search. The analyzer will
          automatically search mainnet → devnet → testnet until the transaction
          is found.
        </Text>
      </Flex>
    </Card>
  )
}
