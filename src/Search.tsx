import {
  CrossCircledIcon,
  MagnifyingGlassIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { extractDigestFromUrl } from "./utils";
import { isValidTransactionDigest } from "@mysten/sui/utils";
import { useSuiClientQuery } from "@mysten/dapp-kit";

export function Search({ onFound }: { onFound: (id: string) => void }) {
  const [query, setQuery] = useState(() => {
    const digest = window.location.hash.slice(1);
    return isValidTransactionDigest(digest) ? digest : "";
  });
  const [digest, setDigest] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  const extractDigestFromInput = (input: string): string => {
    // Try to extract from URL first
    const urlDigest = extractDigestFromUrl(input.trim());
    if (urlDigest) {
      return urlDigest;
    }

    // Direct digest input
    return input.trim();
  };

  const { isPending, error } = useSuiClientQuery(
    "getTransactionBlock",
    {
      digest: digest || "",
    },
    {
      enabled: !!digest,
    },
  );

  // Only consider it pending if the query is enabled and actually pending
  const isActuallyPending = !!digest && isPending;

  useEffect(() => {
    if (error) {
      setSearchError(error.message);
    }
  }, [error]);

  const handleSearch = async () => {
    setSearchError(null);

    if (!query.trim()) {
      setSearchError("Please enter a transaction digest");
      return;
    }

    const digest = extractDigestFromInput(query);
    if (!isValidTransactionDigest(digest)) {
      setSearchError(
        "Please enter a valid transaction digest or Sui Explorer URL",
      );
      return;
    }

    setDigest(digest);
    onFound(digest);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isActuallyPending) {
      handleSearch();
    }
  };

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
            <Button
              onClick={handleSearch}
              disabled={isActuallyPending}
              size="3"
            >
              {isActuallyPending ? (
                <ReloadIcon className="animate-spin" />
              ) : (
                <MagnifyingGlassIcon />
              )}
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
  );
}
