// The engine worker: the core and the bots run here, off the GUI thread (a bot may think for a second). It builds the
// engine once, sends the card catalog, then hands every message to the GameHost.
import { createEngine } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { GameHost, timerScheduler } from "./game-host";
import type { CatalogCard, FromWorker, ToWorker } from "./protocol";

interface WorkerScope {
  postMessage(message: FromWorker): void;
  onmessage: ((event: MessageEvent<ToWorker>) => void) | null;
}

const scope = self as unknown as WorkerScope;
const send = (message: FromWorker): void => scope.postMessage(message);
const describe = (err: unknown): string => (err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err));

try {
  const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
  // A phone is slower than a computer: the planning bots search less there, so they answer in about the same time.
  const host = new GameHost(engine, send, timerScheduler, { botEffort: import.meta.env.MODE === "android" || import.meta.env.MODE === "ios" ? 0.5 : 1 });
  scope.onmessage = (event) => {
    try {
      host.handle(event.data);
    } catch (err) {
      send({ kind: "error", message: describe(err) });
    }
  };
  const catalog: CatalogCard[] = engine.db.all().map((def) => ({ ...def, status: engine.implementationStatus(def.id) }));
  send({ kind: "ready", catalog });
} catch (err) {
  send({ kind: "error", message: `the engine could not start: ${describe(err)}` });
}
