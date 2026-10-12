"use client";
import { useCallback, useState } from "react";
import { transfer, type TransferParams } from "@/contract/write";
import type { TxState, TxStep } from "./states";

/** Ejecuta una transferencia y expone su estado actual. */
export function useTransfer(onConfirmed?: () => void) {
  const [state, setState] = useState<TxState>({ status: "idle" });

  const run = useCallback(
    async (params: TransferParams) => {
      let step: TxStep = "simulando"; // recordamos el último paso alcanzado
      try {
        const hash = await transfer(params, (next) => {
          step = next;
          setState({ status: next });
        });
        setState({ status: "confirmado", hash });
        onConfirmed?.(); // ej: refrescar el saldo
      } catch (error) {
        setState({ status: "error", error, step });
      }
    },
    [onConfirmed],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, run, reset };
}
