"use client";
// La página solo ARMA la interfaz: la lógica vive en wallet/, contract/ y tx/.
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkBanner } from "@/components/NetworkBanner";
import { ScreenView } from "@/components/ScreenView";
import { TxStatus } from "@/components/TxStatus";
import { VotePanel } from "@/components/VotePanel";
import { config } from "@/config";
import { useHasVoted } from "@/contract/useHasVoted";
import { usePoll } from "@/contract/usePoll";
import { mapError } from "@/tx/errors";
import { useVote } from "@/tx/useVote";
import { fundWithFriendbot } from "@/wallet/friendbot";
import { useWallet } from "@/wallet/useWallet";

export default function Home() {
  // ?modo=pantalla → solo resultados grandes, para proyectar
  const screenMode = useSearchParams().get("modo") === "pantalla";
  return screenMode ? <ScreenView /> : <VoteApp />;
}

function VoteApp() {
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
    await fundWithFriendbot(wallet.address);
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
            <p className="font-mono text-xs text-muted uppercase">{config.network} · Soroban</p>
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
              <b className="text-bad">{mapError(error).title}.</b> {mapError(error).message}
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
