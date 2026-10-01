/**
 * Build the PC release (README "发行版"): a folder that runs with Node.js — the built app, the small local server
 * (host/release-server.ts), the sample decks, and the empty folders for the player's own files. `npm run release:pc` at the
 * repository root; options (after `--`):
 *   --out <folder>     where (default: SVEN-<version>-pc beside the repository). It must not exist yet, or be empty.
 *   --public <folder>  copy this folder's files into the release's public/ (default: none, only the empty folders)
 *   --zip              also write <folder>.zip, to send
 * The version is packages/gui/package.json's. VERSION.txt also gets the commit and the engine fingerprint: online, both
 * programs need the same fingerprint.
 */
import { execFileSync } from "node:child_process";
import { cpSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build as bundle } from "esbuild";
import { Zip, ZipDeflate, ZipPassThrough } from "fflate";
import { build } from "vite";
import { engineFingerprint } from "../fingerprint.ts";

const gui = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(gui, "..", "..");
const version = (JSON.parse(readFileSync(join(gui, "package.json"), "utf8")) as { version: string }).version;

const args = process.argv.slice(2);
function option(name: string): string | null {
  const at = args.indexOf(name);
  if (at < 0) return null;
  const value = args[at + 1];
  if (!value || value.startsWith("--")) {
    console.error(`${name} needs a value.`);
    process.exit(1);
  }
  return resolve(value);
}
const out = option("--out") ?? join(repo, "..", `SVEN-${version}-pc`);
const ownPublic = option("--public");
const zip = args.includes("--zip");

// A release folder may already hold someone's own files: never write into one.
if (existsSync(out) && readdirSync(out).length > 0) {
  console.error(`${out} already exists and isn't empty: choose another --out, or delete that folder first.`);
  process.exit(1);
}
if (ownPublic && !(existsSync(ownPublic) && statSync(ownPublic).isDirectory())) {
  console.error(`--public: no folder ${ownPublic}`);
  process.exit(1);
}

/** Every file under `dir`, as paths with "/" ("app/index.html"); with `dirs`, the folders too ("public/fonts/"). */
function filesUnder(dir: string, dirs = false, prefix = ""): string[] {
  const found: string[] = [];
  for (const name of readdirSync(join(dir, prefix)).sort()) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (statSync(join(dir, path)).isDirectory()) {
      if (dirs) found.push(`${path}/`);
      found.push(...filesUnder(dir, dirs, path));
    } else found.push(path);
  }
  return found;
}

/** A text file the way Windows programs (Notepad, cmd) read it: CRLF line ends, and a BOM for UTF-8 text. */
function writeWindowsText(file: string, text: string, bom: boolean): void {
  writeFileSync(file, (bom ? "﻿" : "") + text.replace(/\r?\n/g, "\r\n"), "utf8");
}

const git = (...gitArgs: string[]) => {
  try {
    return execFileSync("git", ["-C", repo, ...gitArgs], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};
const commit = git("rev-parse", "--short", "HEAD") || "unknown";
// Changes not committed yet, in what goes into a release (the packages; not docs or the README).
const uncommitted = git("status", "--porcelain", "--untracked-files=no", "--", "packages") !== "";
const fingerprint = engineFingerprint(gui);

console.log(`Shadowverse: Evolve NEXT ${version} (PC) -> ${out}`);
mkdirSync(out, { recursive: true });

// 1. The app, without public/ (the release has its own).
await build({ configFile: join(gui, "vite.config.ts"), root: gui, publicDir: false, build: { outDir: join(out, "app"), emptyOutDir: true }, logLevel: "warn" });

// 2. The server: one file for Node, with the host code it uses. Paths in its comments are relative to the repository.
await bundle({
  entryPoints: [join(gui, "host", "release-server.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: join(out, "server.mjs"),
  define: { __SVE_VERSION__: JSON.stringify(version) },
  absWorkingDir: repo,
  legalComments: "none",
  logLevel: "warning",
});

// 3. The player's folders: the sample decks, no replays, public/ with its folders (README "自定义资源") and, if asked, files.
cpSync(join(gui, "decks", "samples"), join(out, "decks", "samples"), { recursive: true });
mkdirSync(join(out, "replays"), { recursive: true });
for (const keep of filesUnder(join(gui, "public")).filter((path) => basename(path) === ".gitkeep")) {
  mkdirSync(join(out, "public", dirname(keep)), { recursive: true });
}
if (ownPublic) cpSync(ownPublic, join(out, "public"), { recursive: true });

// 4. How to start it, what it is, and which version.
const fill = (template: string) => readFileSync(join(gui, "release", template), "utf8").replaceAll("{{version}}", version);
writeWindowsText(join(out, "start.bat"), fill("start.bat"), false);
writeWindowsText(join(out, "README.txt"), fill("README.txt"), true);
writeWindowsText(
  join(out, "VERSION.txt"),
  [
    `Shadowverse: Evolve NEXT ${version}`,
    `Built: ${new Date().toISOString().slice(0, 10)}`,
    `Source commit: ${commit}${uncommitted ? " (with changes not committed yet)" : ""}`,
    `Engine fingerprint: ${fingerprint}`,
    "Online play needs the same version on both sides.",
    "",
  ].join("\n"),
  false,
);

// 5. A zip to send: the folder itself at its top, its empty folders kept; pictures and sounds are stored as they are.
if (zip) {
  const file = `${out}.zip`;
  const top = basename(out);
  const stream = createWriteStream(file);
  await new Promise<void>((done, fail) => {
    const archive = new Zip((err, chunk, final) => {
      if (err) return fail(err);
      stream.write(chunk);
      if (final) stream.end(() => done());
    });
    for (const path of filesUnder(out, true)) {
      const name = `${top}/${path}`;
      const entry = path.endsWith("/") || /\.(webp|png|jpe?g|gif|avif|mp3|ogg|m4a|wav|woff2?)$/i.test(path) ? new ZipPassThrough(name) : new ZipDeflate(name, { level: 9 });
      archive.add(entry);
      entry.push(path.endsWith("/") ? new Uint8Array(0) : readFileSync(join(out, path)), true);
    }
    archive.end();
  });
  console.log(`zip: ${file} (${(statSync(file).size / 2 ** 20).toFixed(1)} MB)`);
}

const files = filesUnder(out);
const size = files.reduce((sum, path) => sum + statSync(join(out, path)).size, 0);
console.log(`${files.length} files, ${(size / 2 ** 20).toFixed(1)} MB; commit ${commit}${uncommitted ? " + uncommitted changes" : ""}; engine fingerprint ${fingerprint}`);
console.log(`Try it: node "${relative(process.cwd(), join(out, "server.mjs")) || "server.mjs"}"`);
