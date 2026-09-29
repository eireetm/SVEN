// The GUI's view of its local host: the dev server's `/api` today (host/plugin.ts), Electron's main process later. The rest
// of the app only uses this module for files: card images, the customizable resources, deck files and replays.
import { parseDeckFile, type DeckFile } from "../decks/format";
import type { Replay, ReplayInfo, SeatController } from "../engine/protocol";
import { parseReplay } from "../replays/replay-format";

export interface HostInfo {
  assetsDir: string;
  assetsFound: boolean;
  publicDir: string;
  decksDir: string;
  replaysDir: string;
  /** The Misc images of the assets folder there are: "field", "back", "unknown". */
  misc: string[];
}

export interface DeckFileEntry {
  file: string;
  name: string;
}

/** A saved replay (replays/), newest first, with what the list shows of it (null: the file couldn't be read). */
export interface ReplayFileEntry {
  file: string;
  /** When the file was last written (ms since 1970). */
  modified: number;
  deckNames: [string, string] | null;
  controllers: [SeatController, SeatController] | null;
  info: ReplayInfo | null;
  inputs: number;
}

const encodePath = (path: string): string => path.split("/").map(encodeURIComponent).join("/");

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export const hostApi = {
  info: (): Promise<HostInfo> => getJson<HostInfo>("/api/host"),

  /** Every file under public/ ("images/cards/BP01-001.png", ...). */
  resources: async (): Promise<string[]> => (await getJson<{ files: string[] }>("/api/resources")).files,

  listDecks: async (): Promise<DeckFileEntry[]> => (await getJson<{ decks: DeckFileEntry[] }>("/api/decks")).decks,

  loadDeck: async (file: string): Promise<DeckFile> => parseDeckFile(await getJson<unknown>(`/api/decks/${encodePath(file)}`)),

  saveDeck: async (file: string, deck: DeckFile): Promise<void> => {
    const res = await fetch(`/api/decks/${encodePath(file)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deck, null, 2),
    });
    if (!res.ok) throw new Error(`saving ${file}: ${res.status} ${await res.text()}`);
  },

  deleteDeck: async (file: string): Promise<void> => {
    const res = await fetch(`/api/decks/${encodePath(file)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`deleting ${file}: ${res.status} ${await res.text()}`);
  },

  listReplays: async (): Promise<ReplayFileEntry[]> => (await getJson<{ replays: ReplayFileEntry[] }>("/api/replays")).replays,

  loadReplay: async (file: string): Promise<Replay> => parseReplay(await getJson<unknown>(`/api/replays/${encodeURIComponent(file)}`)),

  saveReplay: async (file: string, replay: Replay): Promise<void> => {
    const res = await fetch(`/api/replays/${encodeURIComponent(file)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replay),
    });
    if (!res.ok) throw new Error(`saving ${file}: ${res.status} ${await res.text()}`);
  },

  deleteReplay: async (file: string): Promise<void> => {
    const res = await fetch(`/api/replays/${encodeURIComponent(file)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`deleting ${file}: ${res.status} ${await res.text()}`);
  },

  /** A Misc image of the assets folder ("field", "back", "unknown"); 404 when there is none. */
  miscUrl: (name: string): string => `/api/misc/${encodeURIComponent(name)}`,

  /** The image of a printing: the player's own (public/images/cards) or the scraped one; 404 when there is none. */
  cardArtUrl: (printing: string, def: string, back = false): string =>
    `/api/card-art/${encodeURIComponent(printing)}?def=${encodeURIComponent(def)}${back ? "&back=1" : ""}`,
};
