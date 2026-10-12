// ─────────────────────────────────────────────────────────────────────────────
// 4. ERRORES · De error técnico a mensaje humano
//
// Los errores llegan de muchos lados (wallet, RPC, contrato) y en formatos
// distintos. mapError() los traduce a algo que el usuario entienda y pueda
// resolver. El detalle técnico se guarda para mostrarlo aparte.
// ─────────────────────────────────────────────────────────────────────────────

export type TxErrorKind =
  | "simulation" // el contrato rechazó la operación al simularla
  | "network" // la wallet está en otra red
  | "rejected" // la red no aceptó la transacción al enviarla
  | "failed" // la red la aceptó, pero falló al ejecutarse
  | "timeout"; // no llegó la confirmación a tiempo

export class TxError extends Error {
  constructor(
    public kind: TxErrorKind,
    message: string,
    public hash?: string, // si ya fue enviada, para verla en el explorador
  ) {
    super(message);
  }
}

export type FriendlyError = {
  title: string;
  message: string;
  action?: "retry" | "friendbot" | "results"; // botón que ofrecemos para resolverlo
  hash?: string;
  detail: string; // texto técnico original
};

/** Texto de cualquier tipo de error (Error, objeto de la wallet, string). */
function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return String(error);
}

export function mapError(error: unknown): FriendlyError {
  const detail = describe(error);
  const has = (pattern: RegExp) => pattern.test(detail);
  const hash = error instanceof TxError ? error.hash : undefined;
  const kind = error instanceof TxError ? error.kind : undefined;
  // SEP-43: las wallets usan el código -4 cuando el usuario rechaza.
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;

  if (code === -4 || has(/reject|declin|denied|cancel/i))
    return { title: "Firma cancelada", message: "Cancelaste la firma en tu wallet.", action: "retry", detail };

  if (has(/Account not found|account entry is missing/i))
    return { title: "Cuenta sin fondos", message: "Tu cuenta todavía no tiene fondos.", action: "friendbot", detail };

  // Errores del contrato: los números son los de PollError en contracts/poll.
  if (has(/Error\(Contract, #2\)/))
    return { title: "Ya votaste", message: "Ya votaste en esta encuesta.", action: "results", detail };

  if (has(/Error\(Contract, #1\)/))
    return { title: "Opción inválida", message: "Esa opción no existe.", detail };

  if (kind === "network" || has(/network passphrase|wrong network/i))
    return { title: "Red equivocada", message: "Tu wallet está en otra red. Cámbiala a Testnet.", detail };

  if (kind === "simulation")
    return { title: "El contrato rechazó el voto", message: "La simulación falló, así que no se pidió ninguna firma ni se gastó nada.", detail };

  if (kind === "timeout" || has(/timeout|timed out|Waited \d+ seconds|Failed to fetch|Network Error|ECONN|50[234]/i))
    return { title: "La red no respondió", message: "El nodo RPC tardó demasiado o no está disponible. Prueba de nuevo en unos segundos.", action: "retry", hash, detail };

  if (kind === "failed" || kind === "rejected")
    return { title: "La red rechazó la transacción", message: "La transacción no se pudo ejecutar.", action: "retry", hash, detail };

  return { title: "Algo salió mal", message: "Ocurrió un error inesperado.", action: "retry", detail };
}
