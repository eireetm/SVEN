import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Where the local host (the dev server's `/api`, later Electron's main process) finds the player's files. Nothing here is
 * shipped: card images are read from the scraped assets on this machine, and everything else is what the player puts in.
 */
export interface HostConfig {
  /** The GUI package (packages/gui). */
  root: string;
  /** Customizable resources, served as-is at "/" (images, textures, audio, fonts, theme.css — public/README.md). */
  publicDir: string;
  /** Deck files (decks/*.json, any sub-folder). */
  decksDir: string;
  /**
   * The scraped card data and images: `<assetsDir>/<printing>/<printing>.webp`. The environment variable SVE_ASSETS_DIR
   * overrides the default, the `assets` folder next to the repository (D:\SVE\assets).
   */
  assetsDir: string;
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function hostConfig(root: string = packageRoot): HostConfig {
  return {
    root,
    publicDir: join(root, "public"),
    decksDir: join(root, "decks"),
    assetsDir: resolve(process.env.SVE_ASSETS_DIR ?? join(root, "..", "..", "..", "assets")),
  };
}
