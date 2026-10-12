// Los contratos no usan decimales: guardan enteros (i128).
// XLM tiene 7 decimales → 1 XLM = 10_000_000 "stroops".
export const DECIMALS = 7;
const UNIT = 10n ** BigInt(DECIMALS);

/** 15000000n → "1.5" */
export function formatAmount(value: bigint): string {
  const whole = value / UNIT;
  const fraction = (value % UNIT).toString().padStart(DECIMALS, "0").replace(/0+$/, "");
  const wholeText = whole.toLocaleString("es-AR");
  return fraction ? `${wholeText},${fraction}` : wholeText;
}

/** "1.5" o "1,5" → 15000000n. Devuelve null si el texto no es un monto válido. */
export function parseAmount(text: string): bigint | null {
  const normalized = text.trim().replace(",", ".");
  const match = /^(\d+)(?:\.(\d{0,7}))?$/.exec(normalized);
  if (!match) return null;
  const [, whole, fraction = ""] = match;
  return BigInt(whole) * UNIT + BigInt(fraction.padEnd(DECIMALS, "0"));
}
