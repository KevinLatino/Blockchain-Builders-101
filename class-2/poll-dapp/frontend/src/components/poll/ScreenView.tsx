"use client";
// Modo pantalla (?modo=pantalla): pregunta y barras grandes.
// Para proyectar mientras el público vota. Se actualiza solo.
import { usePoll } from "@/hooks/usePoll";
import { LiveBadge, PollResults } from "./PollResults";

export function ScreenView() {
  const { poll } = usePoll();
  if (!poll) return <main className="grid min-h-screen place-items-center text-2xl text-muted">Cargando encuesta…</main>;

  const total = poll.results.reduce((a, b) => a + b, 0);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-12 py-12">
      <header className="space-y-4">
        <LiveBadge total={total} big />
        <h1 className="text-7xl font-bold tracking-tight">{poll.question}</h1>
      </header>
      <PollResults poll={poll} size="screen" />
    </main>
  );
}
