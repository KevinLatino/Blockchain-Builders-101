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

export type TxState =
  | { status: "idle" }
  | { status: "simulando" }
  | { status: "esperando-firma" }
  | { status: "enviando" }
  | { status: "confirmado"; hash: string }
  | { status: "error"; error: unknown; step: TxStep }; // en qué paso falló

/** Los pasos intermedios que reporta el ciclo de escritura (contract/write.ts). */
export type TxStep = "simulando" | "esperando-firma" | "enviando";

/** Texto visible para cada estado en curso. */
export const STEP_TEXT: Record<TxStep, string> = {
  simulando: "Preparando…",
  "esperando-firma": "Esperando tu firma…",
  enviando: "Enviando…",
};

/** ¿Hay una operación en curso? (para deshabilitar el botón de enviar) */
export function isBusy(state: TxState): boolean {
  return state.status in STEP_TEXT;
}
