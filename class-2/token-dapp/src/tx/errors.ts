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
  action?: "friendbot"; // mostrar el botón de Friendbot
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
    return { title: "Firma cancelada", message: "Cancelaste la firma en tu wallet. No se envió nada.", detail };

  if (has(/Account not found|account entry is missing/i))
    return { title: "Tu cuenta no tiene fondos", message: "La cuenta todavía no existe en la red. Fondeala con Friendbot y probá de nuevo.", action: "friendbot", detail };

  if (kind === "network" || has(/network passphrase|wrong network/i))
    return { title: "Red equivocada", message: "Tu wallet está en otra red. Cambiala a Testnet y volvé a intentar.", detail };

  if (has(/Error\(Contract, #10\)|balance is not sufficient/i))
    return { title: "Saldo insuficiente", message: "El contrato rechazó la transferencia: no tenés saldo suficiente para ese monto.", detail };

  if (kind === "simulation")
    return { title: "El contrato rechazó la operación", message: "La simulación falló, así que no se pidió ninguna firma ni se gastó nada.", detail };

  if (kind === "timeout" || has(/timeout|timed out|Failed to fetch|Network Error|ECONN|50[234]/i))
    return { title: "La red no respondió", message: "El nodo RPC tardó demasiado o no está disponible. Revisá el estado en el explorador o probá en unos segundos.", hash, detail };

  if (kind === "failed" || kind === "rejected")
    return { title: "La red rechazó la transacción", message: "La transacción no se pudo ejecutar.", hash, detail };

  return { title: "Algo salió mal", message: "Ocurrió un error inesperado.", detail };
}
