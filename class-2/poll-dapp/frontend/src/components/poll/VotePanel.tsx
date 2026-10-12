"use client";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui";
import { isBusy, type TxState } from "@/hooks/useVote";
import type { PollData } from "@/services/poll.service";
import type { VoteParams } from "@/services/poll.service";
import { LiveBadge, PollResults } from "./PollResults";

type Props = {
  poll: PollData;
  voter: string | null; // null = wallet no conectada
  hasVoted: boolean | undefined;
  blocked: boolean; // wallet en la red equivocada
  state: TxState;
  onVote: (params: VoteParams) => void;
  onConnect: () => void;
};

export function VotePanel({ poll, voter, hasVoted, blocked, state, onVote, onConnect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const busy = isBusy(state);
  const canVote = Boolean(voter) && hasVoted === false && !blocked;
  const total = poll.results.reduce((a, b) => a + b, 0);

  return (
    <section className="card rise p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="label">Encuesta</span>
        <LiveBadge total={total} />
      </div>
      <h2 className="mt-2 mb-5 text-2xl font-bold tracking-tight">{poll.question}</h2>

      <PollResults
        poll={poll}
        selected={selected}
        onSelect={canVote ? setSelected : undefined} // sin wallet o ya votó: solo resultados
        disabled={busy}
      />

      <div className="mt-5 border-t border-hairline pt-4">
        {!voter && (
          <PrimaryButton onClick={onConnect} className="w-full">Conecta tu wallet para votar</PrimaryButton>
        )}
        {voter && hasVoted && (
          <p className="text-center text-sm text-dim">
            <span className="text-ok">✓</span> Ya votaste en esta encuesta. Los resultados se actualizan solos.
          </p>
        )}
        {voter && !hasVoted && (
          <PrimaryButton
            onClick={() => selected !== null && onVote({ voter, option: selected })}
            disabled={!canVote || selected === null || busy}
            className="w-full"
          >
            {busy ? "Procesando…" : selected === null ? "Elige una opción" : `Votar por ${poll.options[selected]}`}
          </PrimaryButton>
        )}
      </div>
    </section>
  );
}
