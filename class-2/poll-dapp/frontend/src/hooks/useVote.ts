"use client";
// ─────────────────────────────────────────────────────────────────────────────
// 4. ESTADOS · Máquina de estados de una transacción
//
//   idle → simulando → esperando-firma → enviando → confirmado
//                 ╲            ╲             ╲
//                  ╰────────────┴─────────────┴──→ error
//
// En cada momento la transacción está en UN solo estado, y la interfaz
// muestra exactamente ese estado. Nada de varios booleanos sueltos.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useRef, useState } from "react";
import { mapError, type FriendlyError } from "@/services/errors";
import { vote, type VoteParams, type VoteStep } from "@/services/poll.service";
import { signWithWallet } from "@/services/wallet.service";

export type TxState =
  | { status: "idle" }
  | { status: VoteStep }
  | { status: "confirmado"; hash: string; explorerUrl: string }
  | { status: "error"; error: FriendlyError; step: VoteStep }; // en qué paso falló

/** ¿Hay una operación en curso? (para deshabilitar el botón de enviar) */
export function isBusy(state: TxState): boolean {
  return state.status !== "idle" && state.status !== "confirmado" && state.status !== "error";
}

/** Ejecuta un voto y expone su estado actual. */
export function useVote(onConfirmed?: () => void) {
  const [state, setState] = useState<TxState>({ status: "idle" });
  const last = useRef<VoteParams | null>(null); // para "Reintentar"

  const run = useCallback(
    async (params: VoteParams) => {
      last.current = params;
      let step: VoteStep = "simulando"; // recordamos el último paso alcanzado
      try {
        const result = await vote(params, {
          sign: signWithWallet,
          onStep: (next) => {
            step = next;
            setState({ status: next });
          },
        });
        setState({ status: "confirmado", ...result });
        onConfirmed?.(); // refrescar resultados y "ya votaste"
      } catch (error) {
        setState({ status: "error", error: mapError(error), step });
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
