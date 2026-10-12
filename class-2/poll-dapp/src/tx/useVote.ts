"use client";
import { useCallback, useRef, useState } from "react";
import { vote, type VoteParams } from "@/contract/write";
import type { TxState, TxStep } from "./states";

/** Ejecuta un voto y expone su estado actual. */
export function useVote(onConfirmed?: () => void) {
  const [state, setState] = useState<TxState>({ status: "idle" });
  const last = useRef<VoteParams | null>(null); // para "Reintentar"

  const run = useCallback(
    async (params: VoteParams) => {
      last.current = params;
      let step: TxStep = "simulando"; // recordamos el último paso alcanzado
      try {
        const hash = await vote(params, (next) => {
          step = next;
          setState({ status: next });
        });
        setState({ status: "confirmado", hash });
        onConfirmed?.(); // refrescar resultados y "ya votaste"
      } catch (error) {
        setState({ status: "error", error, step });
      }
    },
    [onConfirmed],
  );

  const retry = useCallback(() => {
    if (last.current) run(last.current);
  }, [run]);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, run, retry, reset };
}
