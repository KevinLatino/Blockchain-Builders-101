// Piezas visuales compartidas. Sin lógica.
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function PrimaryButton({ className = "", ...props }: ComponentProps<"button">) {
  return <button className={`${base} h-10 bg-ink px-4 text-sm text-background hover:bg-ink/85 ${className}`} {...props} />;
}

export function GhostButton({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      className={`${base} h-9 border border-hairline px-3 text-sm text-dim hover:border-hairline-strong hover:text-ink ${className}`}
      {...props}
    />
  );
}

/** Punto de estado: ok (verde) · bad (rojo) · warn (ámbar) · idle (gris) */
export function Dot({ tone }: { tone: "ok" | "bad" | "warn" | "idle" }) {
  const color = { ok: "bg-ok", bad: "bg-bad", warn: "bg-warn", idle: "bg-muted" }[tone];
  return <span className={`inline-block size-1.5 shrink-0 rounded-full ${color}`} />;
}
