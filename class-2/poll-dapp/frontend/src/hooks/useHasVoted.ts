"use client";
import { useCallback, useEffect, useState } from "react";
import { readHasVoted } from "@/services/poll.service";

/** ¿La cuenta conectada ya votó? (lectura del contrato, sin firma) */
export function useHasVoted(address: string | null) {
  const [data, setData] = useState<{ address: string; voted: boolean }>();

  const refresh = useCallback(() => {
    if (!address) return;
    readHasVoted(address).then((voted) => setData({ address, voted }), () => {});
  }, [address]);

  useEffect(refresh, [refresh]);

  // undefined mientras no sabemos (o si cambió la cuenta)
  const hasVoted = data?.address === address ? data.voted : undefined;
  return { hasVoted, refresh };
}
