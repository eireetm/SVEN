// The PC release's local server (scripts/release-pc.ts bundles it into the release as server.mjs, README "发行版"): the
// built app (app/), the player's own files (public/), and the GUI's /api/* (decks, replays, the list of public/ files) —
// the same deck / replay / resource code the dev server's plugin.ts uses. No assets folder: card images and the game's
// look come only from public/ (else the built-in style). Only this computer can reach it (127.0.0.1).
import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { HostConfig } from "./config.ts";
import { deckPath, deleteDeckFile, listDecks, readDeckText, writeDeckText } from "./decks.ts";
import { deleteReplayFile, listReplays, readReplayText, replayPath, writeReplayText } from "./replays.ts";
import { IMAGE_EXTENSIONS, isSafeId, listResources } from "./resources.ts";

/** The release's version (packages/gui/package.json), put in when the release is built. */
declare const __SVE_VERSION__: string;

// The release's folder: where server.mjs, the bundle of this file, is.
const root = dirname(fileURLToPath(import.meta.url));
const appDir = join(root, "app");
const cfg: HostConfig = {
  root,
  publicDir: join(root, "public"),
  decksDir: join(root, "decks"),
  replaysDir: join(root, "replays"),
  // No assets folder in a release.
  assetsDir: "",
  miscDir: "",
};
for (const dir of [cfg.publicDir, cfg.decksDir, cfg.replaysDir]) mkdirSync(dir, { recursive: true });

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
};

const MAX_BODY = 8 << 20;

function sendJson(res: ServerResponse, status: number, value: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(value));
}

function sendText(res: ServerResponse, text: string): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(text);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) reject(new Error("request body too large"));
      else chunks.push(chunk);
    });
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * A file: the app's hashed files are kept by the browser, everything else is asked again (a changed file of public/ is
 * picked up on reload). Byte ranges for music and sounds.
 */
function sendFile(req: IncomingMessage, res: ServerResponse, file: string, immutable: boolean): void {
  const stat = statSync(file);
  const modified = stat.mtime;
  modified.setMilliseconds(0);
  res.setHeader("Content-Type", TYPES[extname(file).toLowerCase()] ?? "application/octet-stream");
  res.setHeader("Last-Modified", modified.toUTCString());
  res.setHeader("Cache-Control", immutable ? "public, max-age=31536000, immutable" : "no-cache");
  res.setHeader("Accept-Ranges", "bytes");
  const since = req.headers["if-modified-since"];
  if (!immutable && since && new Date(since).getTime() >= modified.getTime()) {
    res.statusCode = 304;
    res.end();
    return;
  }
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  if (range && (range[1] !== "" || range[2] !== "")) {
    const size = stat.size;
    const start = range[1] === "" ? Math.max(0, size - Number(range[2])) : Number(range[1]);
    const end = range[1] === "" || range[2] === "" ? size - 1 : Math.min(size - 1, Number(range[2]));
    if (start > end || start >= size) {
      res.statusCode = 416;
      res.setHeader("Content-Range", `bytes */${size}`);
      res.end();
      return;
    }
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
    res.setHeader("Content-Length", String(end - start + 1));
    createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Length", String(stat.size));
  createReadStream(file).pipe(res);
}

/** A file under `dir` for a URL path, or null (nothing outside it: no "..", no hidden files). */
function fileIn(dir: string, path: string): string | null {
  if (path.split("/").some((part) => part === ".." || part.startsWith("."))) return null;
  const base = resolve(dir);
  const full = resolve(base, "." + path);
  if (!full.startsWith(base + sep)) return null;
  return existsSync(full) && statSync(full).isFile() ? full : null;
}

/** A card's own image in public/images/cards/ (by printing, then by definition; `_back` for a back face), or null. */
function cardArt(printing: string, def: string | null, back: boolean): string | null {
  const dir = join(cfg.publicDir, "images", "cards");
  for (const id of [printing, def]) {
    if (!id || !isSafeId(id)) continue;
    const name = back && !id.endsWith("_back") ? `${id}_back` : id;
    for (const ext of IMAGE_EXTENSIONS) {
      const file = join(dir, name + ext);
      if (existsSync(file)) return file;
    }
  }
  return null;
}

/** The GUI's /api (packages/gui/host/plugin.ts has the same, with the assets folder). */
async function api(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
  const path = decodeURIComponent(url.pathname.slice("/api/".length));
  if (path === "host" && req.method === "GET") {
    return sendJson(res, 200, {
      assetsDir: join(cfg.publicDir, "images", "cards"),
      assetsFound: true,
      publicDir: cfg.publicDir,
      decksDir: cfg.decksDir,
      replaysDir: cfg.replaysDir,
      misc: [],
    });
  }
  if (path.startsWith("card-art/") && req.method === "GET") {
    const file = cardArt(path.slice("card-art/".length), url.searchParams.get("def"), url.searchParams.get("back") === "1");
    return file ? sendFile(req, res, file, false) : sendJson(res, 404, { error: "no image" });
  }
  if (path.startsWith("misc/")) return sendJson(res, 404, { error: "no image" });
  if (path === "resources" && req.method === "GET") return sendJson(res, 200, { files: listResources(cfg) });
  if (path === "decks" && req.method === "GET") return sendJson(res, 200, { decks: listDecks(cfg) });
  if (path.startsWith("decks/")) {
    const full = deckPath(cfg, path.slice("decks/".length));
    if (!full) return sendJson(res, 400, { error: "bad deck file name" });
    if (req.method === "GET") return existsSync(full) ? sendText(res, readDeckText(full)) : sendJson(res, 404, { error: "no such deck" });
    if (req.method === "DELETE") {
      if (!existsSync(full)) return sendJson(res, 404, { error: "no such deck" });
      deleteDeckFile(full);
      return sendJson(res, 200, { ok: true });
    }
    if (req.method === "PUT") {
      const text = await readBody(req);
      JSON.parse(text); // refuse what isn't JSON
      writeDeckText(full, text);
      return sendJson(res, 200, { ok: true });
    }
  }
  if (path === "replays" && req.method === "GET") return sendJson(res, 200, { replays: listReplays(cfg) });
  if (path.startsWith("replays/")) {
    const full = replayPath(cfg, path.slice("replays/".length));
    if (!full) return sendJson(res, 400, { error: "bad replay file name" });
    if (req.method === "GET") return existsSync(full) ? sendText(res, readReplayText(full)) : sendJson(res, 404, { error: "no such replay" });
    if (req.method === "DELETE") {
      if (!existsSync(full)) return sendJson(res, 404, { error: "no such replay" });
      deleteReplayFile(full);
      return sendJson(res, 200, { ok: true });
    }
    if (req.method === "PUT") {
      const text = await readBody(req);
      JSON.parse(text); // refuse what isn't JSON
      writeReplayText(full, text);
      return sendJson(res, 200, { ok: true });
    }
  }
  return sendJson(res, 404, { error: "unknown API" });
}

let port = Number(process.env.SVE_PORT ?? process.argv.find((a) => a.startsWith("--port="))?.slice(7) ?? 5170);
const HOST = "127.0.0.1";
const allowedHosts = () => new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);

const server = createServer((req, res) => {
  // Only pages of this server: a web page elsewhere can't reach the API through another host name (DNS rebinding).
  if (!allowedHosts().has(req.headers.host ?? "")) {
    res.statusCode = 403;
    res.end("forbidden");
    return;
  }
  const url = new URL(req.url ?? "/", `http://${HOST}`);
  if (url.pathname.startsWith("/api/")) {
    api(req, res, url).catch((err: unknown) => sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) }));
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "method not allowed" });
  const path = decodeURIComponent(url.pathname);
  if (path === "/" || path === "/index.html") return sendFile(req, res, join(appDir, "index.html"), false);
  const app = fileIn(appDir, path);
  if (app) return sendFile(req, res, app, path.startsWith("/assets/"));
  const own = fileIn(cfg.publicDir, path);
  if (own) return sendFile(req, res, own, false);
  sendJson(res, 404, { error: "not found" });
});

/** The browser on this server's page ("--no-open": not). */
function openBrowser(url: string): void {
  if (process.argv.includes("--no-open")) return;
  const [command, args] =
    process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  try {
    spawn(command, args, { stdio: "ignore", detached: true }).unref();
  } catch {
    // The address is printed: it can be opened by hand.
  }
}

// The port in use (another program has it): the next ones.
let tries = 0;
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE" && tries++ < 10) {
    port++;
    server.listen(port, HOST);
    return;
  }
  console.error(err.message);
  process.exit(1);
});
server.on("listening", () => {
  const url = `http://${HOST}:${port}/`;
  console.log(`Shadowverse: Evolve NEXT ${__SVE_VERSION__}`);
  console.log(`  ${url}`);
  console.log("  浏览器没有自动打开时，手动打开上面的地址。关掉这个窗口就退出。");
  console.log("  ブラウザが開かないときは、上のアドレスを開いてください。このウィンドウを閉じると終了します。");
  console.log("  If no browser opens, open the address above. Close this window to quit.");
  openBrowser(url);
});
server.listen(port, HOST);
