import { isValidTransactionDigest } from '@mysten/sui/utils'
import { CrossCircledIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { extractDigestFromUrl } from './utils'

export function Search({
  onFound,
  initialDigest,
}: {
  onFound: (id: string) => void
  initialDigest?: string | null
}) {
  const [query, setQuery] = useState(initialDigest || '')
  const [searchError, setSearchError] = useState<string | null>(null)

  // Update query when initialDigest prop changes
  useEffect(() => {
    setQuery(initialDigest || '')
  }, [initialDigest])

  const extractDigestFromInput = (input: string): string => {
    // Try to extract from URL first
    const urlDigest = extractDigestFromUrl(input.trim())
    if (urlDigest) {
      return urlDigest
    }

    // Direct digest input
    return input.trim()
  }

  const handleSearch = async () => {
    setSearchError(null)

    if (!query.trim()) {
      setSearchError('Please enter a transaction digest')
      return
    }

    const digest = extractDigestFromInput(query)
    if (!isValidTransactionDigest(digest)) {
      setSearchError(
        'Please enter a valid transaction digest or Sui Explorer URL',
      )
      return
    }

    onFound(digest)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Card mb="6">
      <Flex direction="column" gap="4">
        <Box>
          <Text size="3" weight="medium" mb="2">
            Transaction Digest
          </Text>
          <Flex gap="2">
            <TextField.Root
              placeholder="Enter transaction digest or Sui Explorer URL"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              size="3"
              style={{ flex: 1 }}
            />
            <Button onClick={handleSearch} size="3">
              <MagnifyingGlassIcon />
              Analyze
            </Button>
          </Flex>
        </Box>

        {searchError && (
          <Callout.Root color="red">
            <Callout.Icon>
              <CrossCircledIcon />
            </Callout.Icon>
            <Callout.Text>{searchError}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Card>
  )
}
