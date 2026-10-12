"use client";
// Vista para votar. Solo ARMA la interfaz: el estado viene de hooks/ y la
// lógica vive en services/.
import { useCallback } from "react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { NetworkBanner } from "@/components/wallet/NetworkBanner";
import { stellarConfig } from "@/config/stellar";
import { useHasVoted } from "@/hooks/useHasVoted";
import { usePoll } from "@/hooks/usePoll";
import { useVote } from "@/hooks/useVote";
import { useWallet } from "@/hooks/useWallet";
import { TxStatus } from "./TxStatus";
import { VotePanel } from "./VotePanel";

export function VoteView() {
  const wallet = useWallet();
  const { poll, error, refresh } = usePoll(); // resultados en vivo, sin wallet
  const voted = useHasVoted(wallet.address);

  // Al confirmarse el voto: refrescar barras y "ya votaste" sin esperar 5 s.
  const onConfirmed = useCallback(() => {
    refresh();
    voted.refresh();
  }, [refresh, voted]);
  const tx = useVote(onConfirmed);

  async function fundAndRetry() {
    if (!wallet.address) return;
    await wallet.fund();
    tx.retry(); // con fondos, reintentamos el voto
  }

  function showResults() {
    tx.reset();
    onConfirmed(); // trae los resultados y el "ya votaste" actualizados
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-md bg-ink text-sm font-bold text-background">V</span>
          <div>
            <h1 className="font-bold leading-tight">Votación en vivo</h1>
            <p className="font-mono text-xs text-muted uppercase">{stellarConfig.network} · Soroban</p>
          </div>
        </div>
        <ConnectButton wallet={wallet} />
      </header>

      {wallet.address && <NetworkBanner network={wallet.network} />}

      {poll ? (
        <VotePanel
          poll={poll}
          voter={wallet.address}
          hasVoted={voted.hasVoted}
          blocked={wallet.network === "wrong"}
          state={tx.state}
          onVote={tx.run}
          onConnect={wallet.connect}
        />
      ) : (
        <section className="card p-5 text-sm">
          {error ? (
            <p role="alert" className="text-dim">
              <b className="text-bad">{error.title}.</b> {error.message}
            </p>
          ) : (
            <p className="text-muted">Cargando encuesta…</p>
          )}
        </section>
      )}

      <TxStatus
        state={tx.state}
        onReset={tx.reset}
        onRetry={tx.retry}
        onFund={fundAndRetry}
        onShowResults={showResults}
      />
    </main>
  );
}
