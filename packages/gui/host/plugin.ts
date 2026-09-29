import { createReadStream, existsSync, statSync } from "node:fs";
import { extname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { hostConfig, type HostConfig } from "./config.ts";
import { deckPath, deleteDeckFile, listDecks, readDeckText, writeDeckText } from "./decks.ts";
import { CONTENT_TYPES, findCardArt, findMisc, listMisc, listResources } from "./resources.ts";

/** Information about the local files, for the GUI's settings and debug panel (GET /api/host). */
export interface HostInfo {
  assetsDir: string;
  assetsFound: boolean;
  publicDir: string;
  decksDir: string;
  /** The Misc images there are (HostConfig.miscDir): "field", "back", "unknown", "background_m" ... */
  misc: string[];
}

type Next = (err?: unknown) => void;

const MAX_BODY = 1 << 20;

function sendJson(res: ServerResponse, status: number, value: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(value));
}

/** Send an image file; the browser keeps it and asks again with If-Modified-Since (a changed file is picked up). */
function sendFile(req: IncomingMessage, res: ServerResponse, file: string): void {
  const modified = statSync(file).mtime;
  modified.setMilliseconds(0);
  res.setHeader("Last-Modified", modified.toUTCString());
  res.setHeader("Cache-Control", "no-cache");
  const since = req.headers["if-modified-since"];
  if (since && new Date(since).getTime() >= modified.getTime()) {
    res.statusCode = 304;
    res.end();
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream");
  createReadStream(file).pipe(res);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) reject(new Error("request body too large"));
      else chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * The GUI's local host API under `/api`, served by the dev server and by `vite preview`. It only reads and writes inside
 * the folders of `HostConfig` (card images, public/, decks/). The Electron shell will provide the same API over IPC, so the
 * browser side only knows `src/host/api.ts`.
 *
 *  GET  /api/host                          HostInfo
 *  GET  /api/card-art/<printing>?def=&back= the card's image (the player's own first, then the scraped one), 404 if none
 *  GET  /api/misc/<name>                   a Misc image of the assets folder (field, back, unknown, background_m ...), 404 if none
 *  GET  /api/resources                     { files }: everything under public/
 *  GET  /api/decks                         { decks }: deck files
 *  GET  /api/decks/<file>                  a deck file
 *  PUT  /api/decks/<file>                  save a deck file (JSON body)
 *  DELETE /api/decks/<file>                delete a deck file
 */
export function hostPlugin(cfg: HostConfig = hostConfig()): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse, next: Next): Promise<void> => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!url.pathname.startsWith("/api/")) return next();
    const path = decodeURIComponent(url.pathname.slice("/api/".length));
    try {
      if (path === "host" && req.method === "GET") {
        const info: HostInfo = {
          assetsDir: cfg.assetsDir,
          assetsFound: existsSync(cfg.assetsDir),
          publicDir: cfg.publicDir,
          decksDir: cfg.decksDir,
          misc: listMisc(cfg),
        };
        return sendJson(res, 200, info);
      }
      if (path.startsWith("card-art/") && req.method === "GET") {
        const printing = path.slice("card-art/".length);
        const file = findCardArt(cfg, printing, url.searchParams.get("def"), url.searchParams.get("back") === "1");
        if (!file) return sendJson(res, 404, { error: "no image" });
        return sendFile(req, res, file);
      }
      if (path.startsWith("misc/") && req.method === "GET") {
        const file = findMisc(cfg, path.slice("misc/".length));
        if (!file) return sendJson(res, 404, { error: "no image" });
        return sendFile(req, res, file);
      }
      if (path === "resources" && req.method === "GET") return sendJson(res, 200, { files: listResources(cfg) });
      if (path === "decks" && req.method === "GET") return sendJson(res, 200, { decks: listDecks(cfg) });
      if (path.startsWith("decks/")) {
        const full = deckPath(cfg, path.slice("decks/".length));
        if (!full) return sendJson(res, 400, { error: "bad deck file name" });
        if (req.method === "GET") {
          if (!existsSync(full)) return sendJson(res, 404, { error: "no such deck" });
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(readDeckText(full));
          return;
        }
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
      return sendJson(res, 404, { error: "unknown API" });
    } catch (err) {
      return sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
    }
  };
  const middleware = (req: IncomingMessage, res: ServerResponse, next: Next): void => {
    void handle(req, res, next);
  };
  return {
    name: "sve-host",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
