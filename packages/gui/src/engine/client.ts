// The GUI side of the engine worker: sends messages and hands the worker's messages to subscribers. Requests that expect a
// reply (a replay, a deck check) carry an id.
import type { DeckList } from "@sve/core";
import type { FromWorker, Replay, ToWorker } from "./protocol";

type Listener = (message: FromWorker) => void;

export class EngineClient {
  private readonly worker: Worker;
  private readonly listeners = new Set<Listener>();
  private nextRequest = 1;

  constructor() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module", name: "sve-engine" });
    this.worker.onmessage = (event: MessageEvent<FromWorker>) => this.emit(event.data);
    this.worker.onerror = (event: ErrorEvent) => this.emit({ kind: "error", message: `engine worker: ${event.message}` });
  }

  send(message: ToWorker): void {
    this.worker.postMessage(message);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  exportReplay(): Promise<Replay | null> {
    const requestId = this.nextRequest++;
    return this.request((m) => (m.kind === "replay" && m.requestId === requestId ? m.replay : undefined), { kind: "exportReplay", requestId });
  }

  validateDeck(deck: DeckList, deckRestrictions: boolean): Promise<string[]> {
    const requestId = this.nextRequest++;
    return this.request((m) => (m.kind === "deckValidation" && m.requestId === requestId ? m.errors : undefined), {
      kind: "validateDeck",
      requestId,
      deck,
      deckRestrictions,
    });
  }

  private request<T>(match: (message: FromWorker) => T | undefined, message: ToWorker): Promise<T> {
    return new Promise((resolve) => {
      const stop = this.subscribe((m) => {
        const result = match(m);
        if (result !== undefined) {
          stop();
          resolve(result);
        }
      });
      this.send(message);
    });
  }

  private emit(message: FromWorker): void {
    for (const listener of [...this.listeners]) listener(message);
  }
}
