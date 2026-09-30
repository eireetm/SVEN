// The Android app's host (docs/android.md). Its files live in the app's own folder on the phone,
// Android/data/local.sve.next/files/:
//   public/   the player's own pictures, sounds, fonts and theme.css (public/README.md): copied there over a USB cable, or
//             imported from a zip file in the settings;
//   decks/    deck files; the sample decks are put into decks/samples/ at the start when missing;
//   replays/  saved replays;
//   exports/  files handed to the person (a bug report file), shared from there.
// No assets folder: card images are only the player's own, or those built into the app (a release with resources,
// host/bundled.ts). Loaded by main.tsx in the Android build only.
import { App } from "@capacitor/app";
import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Unzip, UnzipInflate } from "fflate";
import { goBack } from "../app/back";
import { parseDeckFile } from "../decks/format";
import type { SeatController } from "../engine/protocol";
import { parseReplay } from "../replays/replay-format";
import { ownCardArtUrl } from "../resources/lookup";
import type { DeckFileEntry, Host, HostInfo, ImportResult, ReplayFileEntry } from "./api";
import { mergeResources } from "./bundled";
import { resourcePathInZip } from "./zip-paths";

const DIR = Directory.External;

/** public/'s folders (public/README.md), made at the start so the player sees where to copy their files. */
const PUBLIC_FOLDERS = ["audio/bgm", "audio/sfx", "audio/cards", "images/cards", "images/backs", "textures/board", "textures/menu", "textures/icons", "fonts"];

/** The sample decks (decks/samples), in the app. */
const SAMPLES = import.meta.glob<string>("../../decks/samples/*.json", { eager: true, query: "?raw", import: "default" });

async function exists(path: string): Promise<boolean> {
  try {
    await Filesystem.stat({ path, directory: DIR });
    return true;
  } catch {
    return false;
  }
}

async function makeFolder(path: string): Promise<void> {
  if (!(await exists(path))) await Filesystem.mkdir({ path, directory: DIR, recursive: true });
}

/** Every file under `folder` ("images/cards/BP01-001.png"), with its time and size; hidden files left out. */
async function walk(folder: string, prefix = ""): Promise<{ path: string; mtime: number }[]> {
  const out: { path: string; mtime: number }[] = [];
  let files;
  try {
    ({ files } = await Filesystem.readdir({ path: folder + (prefix ? `/${prefix}` : ""), directory: DIR }));
  } catch {
    return out;
  }
  for (const file of files) {
    if (file.name.startsWith(".")) continue;
    const path = prefix ? `${prefix}/${file.name}` : file.name;
    if (file.type === "directory") out.push(...(await walk(folder, path)));
    else out.push({ path, mtime: file.mtime });
  }
  return out;
}

const readText = async (path: string): Promise<string> => (await Filesystem.readFile({ path, directory: DIR, encoding: Encoding.UTF8 })).data as string;

const writeText = (path: string, text: string): Promise<unknown> =>
  Filesystem.writeFile({ path, directory: DIR, data: text.endsWith("\n") ? text : text + "\n", encoding: Encoding.UTF8, recursive: true });

/** A deck file's path in decks/ (sub-folders allowed, as host/decks.ts deckPath), or an error. */
function deckPath(file: string): string {
  if (!/^[\p{L}\p{N} _.()\-/]+\.json$/u.test(file) || file.split("/").some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`bad deck file name: ${file}`);
  }
  return `decks/${file}`;
}

/** A replay file's path in replays/ (as host/replays.ts replayPath), or an error. */
function replayPath(file: string): string {
  if (!/^[\p{L}\p{N} _.()\-]+\.json$/u.test(file) || file.startsWith(".")) throw new Error(`bad replay file name: ${file}`);
  return `replays/${file}`;
}

/** What the list of replays shows of one (host/replays.ts summary). */
function replaySummary(text: string): Pick<ReplayFileEntry, "deckNames" | "controllers" | "info" | "inputs"> {
  try {
    const json = JSON.parse(text) as {
      options?: { deckNames?: [string, string]; controllers?: [SeatController, SeatController] };
      info?: ReplayFileEntry["info"];
      inputs?: unknown[];
    };
    return {
      deckNames: json.options?.deckNames ?? null,
      controllers: json.options?.controllers ?? null,
      info: json.info ?? null,
      inputs: Array.isArray(json.inputs) ? json.inputs.length : 0,
    };
  } catch {
    return { deckNames: null, controllers: null, info: null, inputs: 0 };
  }
}

/** Binary data for Filesystem.writeFile (base64), in slices (a long string of arguments would overflow the stack). */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function concat(chunks: Uint8Array[]): Uint8Array {
  if (chunks.length === 1) return chunks[0]!;
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

/**
 * Import the resources of a zip file into public/ (zip-paths.ts decides where each goes; the rest is skipped). The zip is
 * read as a stream, and each file is written before much more is read: a zip of thousands of pictures fits in memory.
 */
async function importZip(file: File, progress: (written: number) => void): Promise<ImportResult> {
  let written = 0;
  let skipped = 0;
  let failure: unknown = null;
  let queue: Promise<void> = Promise.resolve();
  let queued = 0;
  const unzip = new Unzip((entry) => {
    const target = resourcePathInZip(entry.name);
    if (!target) {
      if (!entry.name.endsWith("/")) skipped++;
      return;
    }
    const chunks: Uint8Array[] = [];
    entry.ondata = (err, data, final) => {
      if (err) {
        failure = err;
        return;
      }
      chunks.push(data);
      if (!final) return;
      queued++;
      queue = queue.then(async () => {
        await Filesystem.writeFile({ path: `public/${target}`, directory: DIR, data: toBase64(concat(chunks)), recursive: true });
        written++;
        queued--;
        progress(written);
      });
    };
    entry.start();
  });
  unzip.register(UnzipInflate);
  const reader = file.stream().getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (failure) throw failure;
    if (done) {
      unzip.push(new Uint8Array(0), true);
      break;
    }
    unzip.push(value);
    if (queued > 8) await queue;
  }
  await queue;
  if (failure) throw failure;
  return { written, skipped };
}

/** The list of the resources built into the app (vite.config.ts writes it; empty without them). */
async function bundledResources(): Promise<string[]> {
  try {
    const res = await fetch("/bundled-resources.json");
    return res.ok ? ((await res.json()) as string[]) : [];
  } catch {
    return [];
  }
}

/** The app's folder as the person finds it with a file manager or over USB ("Android/data/local.sve.next/files"). */
function shownFolder(uri: string): string {
  const path = decodeURIComponent(uri.replace(/^file:\/\//, ""));
  return path.replace(/^\/storage\/emulated\/\d+\//, "").replace(/^\/sdcard\//, "");
}

/** Prepare the app's folder and return the Android host (main.tsx, before anything is shown). */
export async function createAndroidHost(): Promise<Host> {
  for (const folder of PUBLIC_FOLDERS) await makeFolder(`public/${folder}`);
  for (const folder of ["decks/samples", "replays", "exports"]) await makeFolder(folder);
  for (const [source, text] of Object.entries(SAMPLES)) {
    const target = `decks/samples/${source.slice(source.lastIndexOf("/") + 1)}`;
    if (!(await exists(target))) await writeText(target, text);
  }
  const root = (await Filesystem.getUri({ path: "", directory: DIR })).uri.replace(/\/$/, "");
  const folder = shownFolder(root);
  const encode = (path: string) => path.split("/").map(encodeURIComponent).join("/");
  const url = (path: string) => Capacitor.convertFileSrc(`${root}/${encode(path)}`);
  // The built-in resources are served from the app itself; the player's files (as last listed) go before them.
  const bundled = await bundledResources();
  const builtIn = new Set(bundled);
  let own = new Set<string>();

  return {
    platform: "android",
    resourceFolder: `${folder}/public`,
    bundledResources: bundled.length,

    info: async (): Promise<HostInfo> => ({
      assetsDir: `${folder}/public/images/cards`,
      assetsFound: true,
      publicDir: `${folder}/public`,
      decksDir: `${folder}/decks`,
      replaysDir: `${folder}/replays`,
      misc: [],
    }),

    resources: async () => {
      const files = (await walk("public")).map((f) => f.path);
      own = new Set(files);
      return mergeResources(files, bundled);
    },

    listDecks: async () => {
      const out: DeckFileEntry[] = [];
      for (const { path } of await walk("decks")) {
        if (!path.endsWith(".json")) continue;
        let name = path;
        try {
          const json = JSON.parse(await readText(`decks/${path}`)) as { name?: unknown };
          if (typeof json.name === "string" && json.name !== "") name = json.name;
        } catch {
          // The file's name stands for it.
        }
        out.push({ file: path, name });
      }
      return out.sort((a, b) => a.file.localeCompare(b.file));
    },

    loadDeck: async (file) => parseDeckFile(JSON.parse(await readText(deckPath(file)))),

    saveDeck: async (file, deck) => {
      await writeText(deckPath(file), JSON.stringify(deck, null, 2));
    },

    deleteDeck: async (file) => Filesystem.deleteFile({ path: deckPath(file), directory: DIR }),

    listReplays: async () => {
      const out: ReplayFileEntry[] = [];
      for (const { path, mtime } of await walk("replays")) {
        if (path.includes("/") || !path.endsWith(".json")) continue;
        out.push({ file: path, modified: mtime, ...replaySummary(await readText(`replays/${path}`)) });
      }
      return out.sort((a, b) => b.modified - a.modified || a.file.localeCompare(b.file));
    },

    loadReplay: async (file) => parseReplay(JSON.parse(await readText(replayPath(file)))),

    saveReplay: async (file, replay) => {
      await writeText(replayPath(file), JSON.stringify(replay));
    },

    deleteReplay: async (file) => Filesystem.deleteFile({ path: replayPath(file), directory: DIR }),

    resourceUrl: (path) => (builtIn.has(path) && !own.has(path) ? `/${encode(path)}` : url(`public/${path}`)),

    // No assets folder: the host lists no Misc images, so none is asked for.
    miscUrl: () => "",

    cardArtUrl: (printing, def, back = false) => ownCardArtUrl(printing, def, back),

    saveExport: async (fileName, value) => {
      const path = `exports/${fileName}`;
      await writeText(path, JSON.stringify(value, null, 2));
      try {
        await Share.share({ title: fileName, files: [`${root}/${path}`] });
      } catch {
        // Not shared (the person closed the share sheet): the file stays in exports/.
      }
    },

    copyText: async (text) => {
      await Clipboard.write({ string: text });
    },

    importResources: importZip,
  };
}

/** The back button: closes what is open or goes back a screen (app/back.ts); on the main menu the app goes to the background. */
export async function installAndroidShell(): Promise<void> {
  await App.addListener("backButton", () => {
    if (!goBack()) void App.minimizeApp();
  });
}
