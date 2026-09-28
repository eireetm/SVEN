// The look of the game comes in three layers, the first one found wins (public/README.md):
//  1. the player's own files in public/ (images, textures, sounds, fonts, theme.css);
//  2. the local assets folder of this machine: card images, and Misc/ — field (one player's playmat; the opponent's is the
//     same turned 180 degrees), back (the card back) and unknown (for any missing image). Never shipped;
//  3. the built-in style (plain colors and text).
// The host lists what there is once at start; nothing is requested that isn't there.
import { useSyncExternalStore } from "react";
import type { CardInfo } from "../engine/protocol";
import { hostApi } from "../host/api";

const IMAGE = ["png", "jpg", "jpeg", "webp", "gif", "avif"];
const AUDIO = ["mp3", "ogg", "wav", "m4a"];

let files = new Set<string>();
let misc = new Set<string>();
let version = 0;
const listeners = new Set<() => void>();

/** Load the lists of resources (public/ and the Misc images) and apply the theme ones. */
export async function loadResources(): Promise<void> {
  const [resources, info] = await Promise.allSettled([hostApi.resources(), hostApi.info()]);
  files = new Set(resources.status === "fulfilled" ? resources.value : []);
  misc = new Set(info.status === "fulfilled" ? info.value.misc : []);
  applyTheme();
  version++;
  for (const listener of listeners) listener();
}

/** Re-render when the resource lists arrive (images known only then). */
export function useResourcesVersion(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
  );
}

/** "/images/backs/default.png" for the base path "images/backs/default", or null. */
function find(base: string, extensions: readonly string[]): string | null {
  for (const ext of extensions) {
    const path = `${base}.${ext}`;
    if (files.has(path)) return `/${path.split("/").map(encodeURIComponent).join("/")}`;
  }
  return null;
}

const miscUrl = (name: string): string | null => (misc.has(name) ? hostApi.miscUrl(name) : null);

/** One player's playmat: public/textures/board/field.*, else Misc/field. The opponent's is the same turned around. */
export function fieldImageUrl(): string | null {
  return find("textures/board/field", IMAGE) ?? miscUrl("field");
}

/** The card back: public/images/backs/default.*, else Misc/back. */
export function cardBackUrl(): string | null {
  return find("images/backs/default", IMAGE) ?? miscUrl("back");
}

/** The picture for a card whose image is missing: public/images/cards/unknown.*, else Misc/unknown. */
export function unknownImageUrl(): string | null {
  return find("images/cards/unknown", IMAGE) ?? miscUrl("unknown");
}

/** The main menu's background: public/textures/menu/background.*, else the playmat. */
export function menuImageUrl(): string | null {
  return find("textures/menu/background", IMAGE) ?? fieldImageUrl();
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

const cssUrl = (url: string | null): string => (url ? `url("${url}")` : "none");

function applyTheme(): void {
  const root = document.documentElement;
  root.style.setProperty("--sve-card-back-image", cssUrl(cardBackUrl()));
  root.style.setProperty("--sve-field-image", cssUrl(fieldImageUrl()));
  root.style.setProperty("--sve-unknown-image", cssUrl(unknownImageUrl()));
  root.style.setProperty("--sve-menu-image", cssUrl(menuImageUrl()));
  // The player's CSS comes last, so it overrides the built-in style.
  if (files.has("theme.css") && !document.getElementById("sve-theme")) {
    const link = document.createElement("link");
    link.id = "sve-theme";
    link.rel = "stylesheet";
    link.href = "/theme.css";
    document.head.appendChild(link);
  }
}
