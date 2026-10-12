"use client";
import { useState, type FormEvent } from "react";
import type { TransferParams } from "@/contract/write";
import { isBusy, type TxState } from "@/tx/states";
import { validateTransfer } from "@/tx/validate";
import { PrimaryButton } from "./ui";

type Props = {
  from: string;
  balance: bigint | null | undefined;
  blocked: boolean; // wallet en la red equivocada
  state: TxState;
  onSubmit: (params: TransferParams) => void;
};

const input =
  "h-10 w-full rounded-lg border border-hairline bg-background px-3 font-mono text-sm text-ink placeholder:text-muted focus:border-hairline-strong focus:outline-none disabled:opacity-50";

export function TransferForm({ from, balance, blocked, state, onSubmit }: Props) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const busy = isBusy(state);
  const disabled = busy || blocked || typeof balance !== "bigint";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateTransfer(to, amount, balance ?? 0n);
    if ("error" in result) return setFormError(result.error ?? null);
    setFormError(null);
    onSubmit({ from, to: result.to, amount: result.amount });
  }

  return (
    <form onSubmit={handleSubmit} className="card rise space-y-4 p-5">
      <span className="label">Enviar XLM</span>

      <label className="block space-y-1.5">
        <span className="text-sm text-dim">Destino</span>
        <input className={input} value={to} onChange={(e) => setTo(e.target.value)} placeholder="G… o C…" disabled={busy} spellCheck={false} />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-dim">Monto</span>
        <div className="relative">
          <input className={input} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" inputMode="decimal" disabled={busy} />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-muted">XLM</span>
        </div>
      </label>

      {formError && <p role="alert" className="text-sm text-bad">{formError}</p>}

      <PrimaryButton type="submit" disabled={disabled} className="w-full">
        {busy ? "Procesando…" : "Enviar →"}
      </PrimaryButton>
    </form>
  );
}
