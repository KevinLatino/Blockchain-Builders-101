"use client";
// La página solo ARMA la interfaz: la lógica vive en wallet/, contract/ y tx/.
import { BalanceCard } from "@/components/BalanceCard";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkBanner } from "@/components/NetworkBanner";
import { TransferForm } from "@/components/TransferForm";
import { TxStatus } from "@/components/TxStatus";
import { config } from "@/config";
import { useBalance } from "@/contract/useBalance";
import { useTransfer } from "@/tx/useTransfer";
import { fundWithFriendbot } from "@/wallet/friendbot";
import { useWallet } from "@/wallet/useWallet";

export default function Home() {
  const wallet = useWallet();
  const balance = useBalance(wallet.address);
  const tx = useTransfer(balance.refresh); // al confirmar, se refresca el saldo

  async function fundAndRetry() {
    if (!wallet.address) return;
    await fundWithFriendbot(wallet.address);
    balance.refresh();
    tx.reset();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-md bg-ink text-sm font-bold text-background">T</span>
          <div>
            <h1 className="font-bold leading-tight">Token dApp</h1>
            <p className="font-mono text-xs text-muted uppercase">{config.network} · SEP-41</p>
          </div>
        </div>
        <ConnectButton wallet={wallet} />
      </header>

      {!wallet.address && wallet.ready && (
        <section className="card rise p-6">
          <span className="label">Paso 1</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Conectá tu wallet</h2>
          <p className="mt-2 max-w-md text-sm text-dim">
            La app nunca ve tu clave privada: solo pide tu dirección y le pide a tu wallet que firme.
          </p>
        </section>
      )}

      {wallet.address && (
        <>
          <NetworkBanner network={wallet.network} />
          <BalanceCard address={wallet.address} balance={balance} />
          {tx.state.status !== "confirmado" && (
            <TransferForm
              from={wallet.address}
              balance={balance.balance}
              blocked={wallet.network === "wrong"}
              state={tx.state}
              onSubmit={tx.run}
            />
          )}
          <TxStatus state={tx.state} onReset={tx.reset} onFund={fundAndRetry} />
        </>
      )}
    </main>
  );
}
