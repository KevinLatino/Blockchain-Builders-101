"use client";
import { useCallback, useEffect, useState, useTransition } from "react";
import { readBalance } from "./read";

/** Saldo de la cuenta conectada. Se consulta al conectar y con `refresh()`. */
export function useBalance(address: string | null) {
  // Guardamos de qué cuenta es el saldo, para no mostrar el de otra cuenta.
  const [data, setData] = useState<{ address: string; value: bigint | null }>();
  const [error, setError] = useState<unknown>(null);
  // `loading` es true mientras corre la consulta asíncrona.
  const [loading, startLoading] = useTransition();

  const refresh = useCallback(() => {
    if (!address) return;
    startLoading(async () => {
      try {
        const value = await readBalance(address);
        setData({ address, value });
        setError(null);
      } catch (e) {
        setError(e);
      }
    });
  }, [address]);

  // Cada vez que cambia la cuenta conectada, consultamos su saldo.
  useEffect(refresh, [refresh]);

  // undefined = todavía no sabemos · null = cuenta sin fondos
  const balance = data?.address === address ? data.value : undefined;
  return { balance, loading, error, refresh };
}

export type Balance = ReturnType<typeof useBalance>;
