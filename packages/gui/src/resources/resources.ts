// The player's customizable resources in public/ (public/README.md). The host lists them once at start; each one is used
// only if it exists, otherwise the built-in look stays. This is the "shell" layer: art, textures, sounds, fonts and CSS
// are the player's, the game is the engine's.
import type { CardInfo } from "../engine/protocol";
import { hostApi } from "../host/api";

const IMAGE = ["png", "jpg", "jpeg", "webp", "gif", "avif"];
const AUDIO = ["mp3", "ogg", "wav", "m4a"];

let files = new Set<string>();

/** Load the list of resources and apply the theme ones (theme.css, card back, board background). */
export async function loadResources(): Promise<void> {
  try {
    files = new Set(await hostApi.resources());
  } catch {
    files = new Set();
  }
  applyTheme();
}

/** "/images/backs/default.png" for the base path "images/backs/default", or null. */
function find(base: string, extensions: readonly string[]): string | null {
  for (const ext of extensions) {
    const path = `${base}.${ext}`;
    if (files.has(path)) return `/${path.split("/").map(encodeURIComponent).join("/")}`;
  }
  return null;
}

/** An icon for a card-text token ("fanfare", "cost02", ...), from public/textures/icons/. */
export function iconUrl(token: string): string | null {
  return find(`textures/icons/${token}`, IMAGE);
}

/** A sound for an event, the card's own first (public/audio/cards/<printing or definition>/<event>), then the common one. */
export function soundUrl(event: string, card?: CardInfo): string | null {
  for (const id of [card?.printing, card?.def]) {
    if (!id) continue;
    const found = find(`audio/cards/${id}/${event}`, AUDIO);
    if (found) return found;
  }
  return find(`audio/sfx/${event}`, AUDIO);
}

function applyTheme(): void {
  const root = document.documentElement;
  const back = find("images/backs/default", IMAGE);
  if (back) root.style.setProperty("--sve-card-back-image", `url("${back}")`);
  const board = find("textures/board/background", IMAGE);
  if (board) root.style.setProperty("--sve-board-image", `url("${board}")`);
  // The player's CSS comes last, so it overrides the built-in style.
  if (files.has("theme.css") && !document.getElementById("sve-theme")) {
    const link = document.createElement("link");
    link.id = "sve-theme";
    link.rel = "stylesheet";
    link.href = "/theme.css";
    document.head.appendChild(link);
  }
}
