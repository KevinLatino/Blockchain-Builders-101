"use client";
import { useState } from "react";
import { config } from "@/config";
import { mapError } from "@/tx/errors";
import { STEP_TEXT, type TxState, type TxStep } from "@/tx/states";
import { GhostButton, PrimaryButton } from "./ui";

type Props = {
  state: TxState;
  onReset: () => void;
  onFund: () => Promise<void>; // Friendbot, para el error "cuenta sin fondos"
};

// Las líneas del log, en orden. Cada una explica qué pasa en ese paso.
const LINES: { step: TxStep | "confirmado"; text: string; detail: string }[] = [
  { step: "simulando", text: STEP_TEXT.simulando, detail: "construir + simular" },
  { step: "esperando-firma", text: STEP_TEXT["esperando-firma"], detail: "la wallet firma" },
  { step: "enviando", text: STEP_TEXT.enviando, detail: "enviar + esperar ledger" },
  { step: "confirmado", text: "Confirmado ✓", detail: "incluida en la blockchain" },
];

/** Hasta qué línea llegamos y si esa línea falló. */
function progress(state: TxState) {
  if (state.status === "confirmado") return { current: LINES.length, failed: false };
  const step = state.status === "error" ? state.step : state.status;
  return { current: LINES.findIndex((l) => l.step === step), failed: state.status === "error" };
}

export function TxStatus({ state, onReset, onFund }: Props) {
  const [funding, setFunding] = useState(false);
  if (state.status === "idle") return null;

  const { current, failed } = progress(state);

  return (
    <section className="card rise overflow-hidden" aria-live="polite">
      <header className="flex items-center gap-3 border-b border-hairline bg-surface-2 px-4 py-2.5">
        <span className="flex gap-1.5">
          <i className="size-2 rounded-full bg-hairline-strong" />
          <i className="size-2 rounded-full bg-hairline-strong" />
          <i className="size-2 rounded-full bg-hairline-strong" />
        </span>
        <span className="font-mono text-xs text-muted">transferencia.log</span>
      </header>

      <ol className="space-y-2.5 px-4 py-4 font-mono text-sm">
        {LINES.map((line, i) => {
          const done = i < current;
          const active = i === current && !failed;
          const error = i === current && failed;
          return (
            <li key={line.step} className={`flex items-center gap-3 ${done || active || error ? "text-ink" : "text-muted/60"}`}>
              <span className="w-5 text-center">
                {done && <span className="text-ok">✓</span>}
                {active && <span className="inline-block size-3 animate-spin rounded-full border-2 border-ink border-t-transparent" />}
                {error && <span className="text-bad">✗</span>}
                {!done && !active && !error && "·"}
              </span>
              <span className={error ? "text-bad" : ""}>{line.text.replace(" ✓", "")}</span>
              <span className="ml-auto text-xs text-muted">{line.detail}</span>
            </li>
          );
        })}
      </ol>

      {state.status === "confirmado" && (
        <footer className="space-y-3 border-t border-hairline px-4 py-4">
          <p className="text-lg font-bold text-ok">Confirmado ✓</p>
          <div>
            <span className="label">Hash de la transacción</span>
            <a href={`${config.explorerUrl}/tx/${state.hash}`} target="_blank" rel="noreferrer" className="mt-1 block break-all font-mono text-sm text-ink underline decoration-hairline-strong underline-offset-4 hover:decoration-ink">
              {state.hash} ↗
            </a>
          </div>
          <PrimaryButton onClick={onReset}>Nueva transferencia</PrimaryButton>
        </footer>
      )}

      {state.status === "error" && <ErrorFooter error={state.error} onReset={onReset} funding={funding} onFund={async () => {
        setFunding(true);
        try { await onFund(); } finally { setFunding(false); }
      }} />}
    </section>
  );
}

function ErrorFooter({ error, onReset, onFund, funding }: { error: unknown; onReset: () => void; onFund: () => void; funding: boolean }) {
  const friendly = mapError(error);
  return (
    <footer role="alert" className="space-y-3 border-t border-hairline px-4 py-4">
      <div>
        <p className="text-lg font-bold text-bad">{friendly.title}</p>
        <p className="mt-1 text-sm text-dim">{friendly.message}</p>
      </div>

      {friendly.hash && (
        <a href={`${config.explorerUrl}/tx/${friendly.hash}`} target="_blank" rel="noreferrer" className="block font-mono text-sm text-dim underline underline-offset-4">
          Ver la transacción en el explorador ↗
        </a>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer text-muted hover:text-dim">Detalle técnico</summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-background p-3 font-mono text-xs whitespace-pre-wrap text-muted">{friendly.detail}</pre>
      </details>

      <div className="flex gap-2">
        {friendly.action === "friendbot" && (
          <PrimaryButton onClick={onFund} disabled={funding}>{funding ? "Fondeando…" : "Fondear con Friendbot"}</PrimaryButton>
        )}
        <GhostButton onClick={onReset} className="h-10">Entendido</GhostButton>
      </div>
    </footer>
  );
}
