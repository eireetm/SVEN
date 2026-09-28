import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative, sep } from "node:path";
import type { HostConfig } from "./config.ts";

export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"] as const;

export const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".json": "application/json; charset=utf-8",
};

/** A printing or definition id used as a file name: letters, digits, "-" and "_" (also the circled S of BP03-LDⓈ01). */
const SAFE_ID = /^[\p{L}\p{N}_-]{1,64}$/u;

export const isSafeId = (id: string): boolean => SAFE_ID.test(id);

/**
 * The image file to show for a card, or null (the GUI then draws a text placeholder). In order:
 *  1. the player's own image in public/images/cards/, named by printing (`BP01-001.png`), then by definition id;
 *  2. the printing's scraped image in the assets folder (`<assets>/BP01-001/BP01-001.webp`).
 * `back`: the back face of a double-faced card (CR 2.14): `<id>_back.*`, and the scraped `<printing>_back.webp`.
 */
export function findCardArt(cfg: HostConfig, printing: string, def: string | null, back = false): string | null {
  const suffix = back ? "_back" : "";
  const custom = join(cfg.publicDir, "images", "cards");
  for (const id of [printing, def]) {
    if (!id || !isSafeId(id)) continue;
    // A back face's definition id already ends with "_back" (BP09-005_back).
    const name = back && !id.endsWith("_back") ? id + suffix : id;
    for (const ext of IMAGE_EXTENSIONS) {
      const file = join(custom, name + ext);
      if (existsSync(file)) return file;
    }
  }
  if (!isSafeId(printing)) return null;
  for (const ext of [".webp", ".png", ".jpg"]) {
    const file = join(cfg.assetsDir, printing, printing + suffix + ext);
    if (existsSync(file)) return file;
  }
  return null;
}

/** A Misc image (`field`, `back`, `unknown`, see HostConfig.miscDir) by its name without extension, or null. */
export function findMisc(cfg: HostConfig, name: string): string | null {
  if (!isSafeId(name)) return null;
  for (const ext of IMAGE_EXTENSIONS) {
    const file = join(cfg.miscDir, name + ext);
    if (existsSync(file)) return file;
  }
  return null;
}

/** The names of the Misc images there are ("back", "field", ...). */
export function listMisc(cfg: HostConfig): string[] {
  if (!existsSync(cfg.miscDir)) return [];
  const names = readdirSync(cfg.miscDir)
    .filter((f) => (IMAGE_EXTENSIONS as readonly string[]).includes(extname(f).toLowerCase()))
    .map((f) => basename(f, extname(f)))
    .filter(isSafeId);
  return [...new Set(names)].sort();
}

/** Every file under public/ (the customizable resources) as a URL path, e.g. "images/cards/BP01-001.png". */
export function listResources(cfg: HostConfig): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (name.startsWith(".")) continue;
      const file = join(dir, name);
      if (statSync(file).isDirectory()) walk(file);
      else out.push(relative(cfg.publicDir, file).split(sep).join("/"));
    }
  };
  if (existsSync(cfg.publicDir)) walk(cfg.publicDir);
  return out.sort();
}
