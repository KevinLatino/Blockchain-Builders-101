import { PollApp } from "@/components/poll/PollApp";

/** Página de inicio: server component que solo monta la dApp (que es "use client"). */
export default function Home() {
  return <PollApp />;
}
