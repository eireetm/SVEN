import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Where the local host (the dev server's `/api`, later Electron's main process) finds the player's files. Nothing here is
 * shipped: card images are read from the scraped assets on this machine, and everything else is what the player puts in.
 */
export interface HostConfig {
  /** The GUI package (packages/gui). */
  root: string;
  /** Customizable resources, served as-is at "/" (images, textures, audio, fonts, theme.css — README "Custom resources"). */
  publicDir: string;
  /** Deck files (decks/*.json, any sub-folder). */
  decksDir: string;
  /** Saved replays (replays/*.json: "保存录像" at the end of a game, "观看录像" in the main menu). */
  replaysDir: string;
  /**
   * The scraped card data and images: `<assetsDir>/<printing>/<printing>.webp`. The environment variable SVE_ASSETS_DIR
   * overrides the default, the `assets` folder next to the repository (D:\SVE\assets).
   */
  assetsDir: string;
  /**
   * Local images of the game's look that the project doesn't ship either: `<assetsDir>/Misc/` — `field` (one player's
   * playmat; the opponent's is the same turned 180 degrees), `back` (the card back) and `unknown` (for a missing image);
   * optionally the backgrounds `background_m` (main menu), `background_d` (deck builder) and `background_f` (battlefield).
   */
  miscDir: string;
  /**
   * The settings file (settings.ini, src/app/settings-file.ts): the PC release's is next to server.mjs. The dev server
   * keeps none unless the environment variable SVE_SETTINGS_FILE names one (the settings stay in the browser).
   */
  settingsFile?: string;
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function hostConfig(root: string = packageRoot): HostConfig {
  const assetsDir = resolve(process.env.SVE_ASSETS_DIR ?? join(root, "..", "..", "..", "assets"));
  return {
    root,
    publicDir: join(root, "public"),
    decksDir: join(root, "decks"),
    replaysDir: join(root, "replays"),
    assetsDir,
    miscDir: join(assetsDir, "Misc"),
    ...(process.env.SVE_SETTINGS_FILE ? { settingsFile: resolve(process.env.SVE_SETTINGS_FILE) } : {}),
  };
}
