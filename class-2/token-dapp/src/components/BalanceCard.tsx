"use client";
import { useState } from "react";
import { config } from "@/config";
import { formatAmount } from "@/contract/amount";
import type { Balance } from "@/contract/useBalance";
import { mapError } from "@/tx/errors";
import { fundWithFriendbot } from "@/wallet/friendbot";
import { shortAddress } from "./ConnectButton";
import { GhostButton, PrimaryButton } from "./ui";

type Props = { address: string; balance: Balance };

export function BalanceCard({ address, balance }: Props) {
  const [funding, setFunding] = useState(false);

  async function fund() {
    setFunding(true);
    try {
      await fundWithFriendbot(address);
      balance.refresh();
    } finally {
      setFunding(false);
    }
  }

  return (
    <section className="card rise p-5">
      <div className="flex items-center justify-between">
        <span className="label">Saldo</span>
        <GhostButton onClick={balance.refresh} disabled={balance.loading} className="h-8 px-2.5 text-xs">
          {balance.loading ? "Consultando…" : "↻ Refrescar"}
        </GhostButton>
      </div>

      {balance.balance === undefined && !balance.error && (
        <p className="mt-2 text-4xl font-bold text-hairline-strong">—</p>
      )}

      {typeof balance.balance === "bigint" && (
        <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
          {formatAmount(balance.balance)}
          <span className="ml-2 text-xl font-medium text-muted">XLM</span>
        </p>
      )}

      {balance.balance === null && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-dim">
            <b className="text-warn">Tu cuenta no tiene fondos.</b> Todavía no existe en la red.
          </p>
          <PrimaryButton onClick={fund} disabled={funding}>
            {funding ? "Fondeando…" : "Fondear con Friendbot"}
          </PrimaryButton>
        </div>
      )}

      {Boolean(balance.error) && (
        <p role="alert" className="mt-3 text-sm text-dim">
          <b className="text-bad">{mapError(balance.error).title}.</b> {mapError(balance.error).message}
        </p>
      )}

      {/* Dato para la clase: de dónde sale este número */}
      <p className="mt-5 border-t border-hairline pt-3 font-mono text-xs text-muted">
        balance(id) · contrato {shortAddress(config.contractId)} · SEP-41
      </p>
    </section>
  );
}
