"use client";
import { useSearchParams } from "next/navigation";
import { ScreenView } from "./ScreenView";
import { VoteView } from "./VoteView";

/** Elige la vista: votar (por defecto) o ?modo=pantalla para proyectar. */
export function PollApp() {
  const screenMode = useSearchParams().get("modo") === "pantalla";
  return screenMode ? <ScreenView /> : <VoteView />;
}
