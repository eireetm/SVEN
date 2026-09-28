// The GUI's view of its local host: the dev server's `/api` today (host/plugin.ts), Electron's main process later. The rest
// of the app only uses this module for files: card images, the customizable resources and deck files.
import { parseDeckFile, type DeckFile } from "../decks/format";

export interface HostInfo {
  assetsDir: string;
  assetsFound: boolean;
  publicDir: string;
  decksDir: string;
  /** The Misc images of the assets folder there are: "field", "back", "unknown". */
  misc: string[];
}

export interface DeckFileEntry {
  file: string;
  name: string;
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

  /** A Misc image of the assets folder ("field", "back", "unknown"); 404 when there is none. */
  miscUrl: (name: string): string => `/api/misc/${encodeURIComponent(name)}`,

  /** The image of a printing: the player's own (public/images/cards) or the scraped one; 404 when there is none. */
  cardArtUrl: (printing: string, def: string, back = false): string =>
    `/api/card-art/${encodeURIComponent(printing)}?def=${encodeURIComponent(def)}${back ? "&back=1" : ""}`,
};
