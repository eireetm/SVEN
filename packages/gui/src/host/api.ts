// The GUI's view of its local host: on a computer, the `/api` of the dev server (host/plugin.ts) or of a release's server;
// in the Android app, the app's own folder on the phone (host/android.ts); Electron's main process later.
// The rest of the app only uses this module for files: card images, the customizable resources, deck files, replays, and
// what it hands to the person (a bug report file, a text to paste elsewhere).
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

/** What importing the player's resources from a zip file did (the Android app, settings "资源"). */
export interface ImportResult {
  written: number;
  /** Files of the zip outside the resource folders (README "Custom resources"), not imported. */
  skipped: number;
}

export interface Host {
  /** Where the GUI runs: a computer's browser (the dev server, a release), or the Android app. */
  readonly platform: "web" | "android";
  info(): Promise<HostInfo>;
  /** Every file under public/ ("images/cards/BP01-001.png", ...). */
  resources(): Promise<string[]>;
  listDecks(): Promise<DeckFileEntry[]>;
  loadDeck(file: string): Promise<DeckFile>;
  saveDeck(file: string, deck: DeckFile): Promise<void>;
  deleteDeck(file: string): Promise<void>;
  listReplays(): Promise<ReplayFileEntry[]>;
  loadReplay(file: string): Promise<Replay>;
  saveReplay(file: string, replay: Replay): Promise<void>;
  deleteReplay(file: string): Promise<void>;
  /** The URL of a file of public/ ("images/cards/BP01-001.png"). */
  resourceUrl(path: string): string;
  /** A Misc image of the assets folder ("field", "back", "unknown"); 404 when there is none. */
  miscUrl(name: string): string;
  /**
   * The image of a printing: on a computer the player's own (public/images/cards) or the scraped one, 404 when there is none;
   * in the Android app only the player's own, and null when there is none.
   */
  cardArtUrl(printing: string, def: string, back?: boolean): string | null;
  /** Hand a JSON file to the person: the browser saves it; the phone keeps it (exports/) and offers to share it. */
  saveExport(fileName: string, value: unknown): Promise<void>;
  /** Put a text on the clipboard. */
  copyText(text: string): Promise<void>;
  /** The Android app: the folder the player copies their own files into (null elsewhere: public/ of the project). */
  readonly resourceFolder: string | null;
  /** The Android app: how many resources are built into it (a release with resources; host/bundled.ts). */
  readonly bundledResources?: number;
  /** The Android app: import resources from a zip file into that folder. */
  importResources?(file: File, progress: (written: number) => void): Promise<ImportResult>;
}

const encodePath = (path: string): string => path.split("/").map(encodeURIComponent).join("/");

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

/**
 * A computer: the `/api` of the dev server or of a release's server. What needs the browser's page (saving a file,
 * the clipboard) is host/web.ts's, which main.tsx puts in place (the tests use this one without a browser).
 */
export const serverHost: Host = {
  platform: "web",
  resourceFolder: null,

  info: () => getJson<HostInfo>("/api/host"),

  resources: async () => (await getJson<{ files: string[] }>("/api/resources")).files,

  listDecks: async () => (await getJson<{ decks: DeckFileEntry[] }>("/api/decks")).decks,

  loadDeck: async (file) => parseDeckFile(await getJson<unknown>(`/api/decks/${encodePath(file)}`)),

  saveDeck: async (file, deck) => {
    const res = await fetch(`/api/decks/${encodePath(file)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deck, null, 2),
    });
    if (!res.ok) throw new Error(`saving ${file}: ${res.status} ${await res.text()}`);
  },

  deleteDeck: async (file) => {
    const res = await fetch(`/api/decks/${encodePath(file)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`deleting ${file}: ${res.status} ${await res.text()}`);
  },

  listReplays: async () => (await getJson<{ replays: ReplayFileEntry[] }>("/api/replays")).replays,

  loadReplay: async (file) => parseReplay(await getJson<unknown>(`/api/replays/${encodeURIComponent(file)}`)),

  saveReplay: async (file, replay) => {
    const res = await fetch(`/api/replays/${encodeURIComponent(file)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replay),
    });
    if (!res.ok) throw new Error(`saving ${file}: ${res.status} ${await res.text()}`);
  },

  deleteReplay: async (file) => {
    const res = await fetch(`/api/replays/${encodeURIComponent(file)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`deleting ${file}: ${res.status} ${await res.text()}`);
  },

  resourceUrl: (path) => `/${encodePath(path)}`,

  miscUrl: (name) => `/api/misc/${encodeURIComponent(name)}`,

  cardArtUrl: (printing, def, back = false) =>
    `/api/card-art/${encodeURIComponent(printing)}?def=${encodeURIComponent(def)}${back ? "&back=1" : ""}`,

  saveExport: () => Promise.reject(new Error("saving a file needs the browser's page (host/web.ts)")),

  copyText: () => Promise.reject(new Error("the clipboard needs the browser's page (host/web.ts)")),
};

let current: Host = serverHost;

/** The host the app runs on (main.tsx: the Android app's, before anything is shown). */
export function setHost(host: Host): void {
  current = host;
}

/** The current host, for the whole app. */
export const hostApi: Host = {
  get platform() {
    return current.platform;
  },
  get resourceFolder() {
    return current.resourceFolder;
  },
  get bundledResources() {
    return current.bundledResources;
  },
  info: () => current.info(),
  resources: () => current.resources(),
  listDecks: () => current.listDecks(),
  loadDeck: (file) => current.loadDeck(file),
  saveDeck: (file, deck) => current.saveDeck(file, deck),
  deleteDeck: (file) => current.deleteDeck(file),
  listReplays: () => current.listReplays(),
  loadReplay: (file) => current.loadReplay(file),
  saveReplay: (file, replay) => current.saveReplay(file, replay),
  deleteReplay: (file) => current.deleteReplay(file),
  resourceUrl: (path) => current.resourceUrl(path),
  miscUrl: (name) => current.miscUrl(name),
  cardArtUrl: (printing, def, back) => current.cardArtUrl(printing, def, back),
  saveExport: (fileName, value) => current.saveExport(fileName, value),
  copyText: (text) => current.copyText(text),
  importResources: (file, progress) => {
    if (!current.importResources) throw new Error("importing resources is only in the Android app");
    return current.importResources(file, progress);
  },
};
