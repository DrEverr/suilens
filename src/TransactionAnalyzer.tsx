import { CrossCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Container, Spinner } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { multiNetworkClient, type NetworkSearchResult } from './multiNetwork'
import { Summary } from './Summary'

export function TransactionAnalyzer({ digest }: { digest: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<NetworkSearchResult | null>(
    null,
  )

  useEffect(() => {
    if (!digest) return

    const searchTransaction = async () => {
      setIsLoading(true)
      setError(null)
      setTransaction(null)

      try {
        const result = await multiNetworkClient.findTransaction(digest)
        setTransaction(result)
      } catch {
        setError('Transaction not found on any network!')
      } finally {
        setIsLoading(false)
      }
    }

    searchTransaction()
  }, [digest])

  return (
    <Container size="4" p="4">
      {isLoading && (
        <Box className="fade-in">
          <Spinner />
        </Box>
      )}

      {error && (
        <Callout.Root color="red">
          <Callout.Icon>
            <CrossCircledIcon />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {transaction && !isLoading && !error && <Summary txn={transaction} />}
    </Container>
  )
}
