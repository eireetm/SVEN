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
  /**
   * Local images of the game's look that the project doesn't ship either: `<assetsDir>/Misc/` — `field` (one player's
   * playmat; the opponent's is the same turned 180 degrees), `back` (the card back) and `unknown` (for a missing image).
   */
  miscDir: string;
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function hostConfig(root: string = packageRoot): HostConfig {
  const assetsDir = resolve(process.env.SVE_ASSETS_DIR ?? join(root, "..", "..", "..", "assets"));
  return { root, publicDir: join(root, "public"), decksDir: join(root, "decks"), assetsDir, miscDir: join(assetsDir, "Misc") };
}
