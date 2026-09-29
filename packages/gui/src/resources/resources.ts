// The look of the game comes in three layers, the first one found wins (public/README.md):
//  1. the player's own files in public/ (images, textures, sounds, fonts, theme.css);
//  2. the local assets folder of this machine: card images, and Misc/ — field (one player's playmat; the opponent's is the
//     same turned 180 degrees), back (the card back), unknown (for any missing image) and, if there, the backgrounds
//     background_m / background_d / background_f. Never shipped;
//  3. the built-in style (plain colors and text).
// The host lists what there is once at start; nothing is requested that isn't there. The lookups are in lookup.ts.
import { useSyncExternalStore } from "react";
import { hostApi } from "../host/api";
import { battleImageUrl, builderImageUrl, cardBackUrl, fieldImageUrl, hasResource, menuImageUrl, setResourceLists, unknownImageUrl } from "./lookup";

let version = 0;
const listeners = new Set<() => void>();

/** Load the lists of resources (public/ and the Misc images) and apply the theme ones. */
export async function loadResources(): Promise<void> {
  const [resources, info] = await Promise.allSettled([hostApi.resources(), hostApi.info()]);
  setResourceLists(resources.status === "fulfilled" ? resources.value : [], info.status === "fulfilled" ? info.value.misc : []);
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

const cssUrl = (url: string | null): string => (url ? `url("${url}")` : "none");

function applyTheme(): void {
  const root = document.documentElement;
  root.style.setProperty("--sve-card-back-image", cssUrl(cardBackUrl()));
  root.style.setProperty("--sve-field-image", cssUrl(fieldImageUrl()));
  root.style.setProperty("--sve-unknown-image", cssUrl(unknownImageUrl()));
  root.style.setProperty("--sve-menu-image", cssUrl(menuImageUrl()));
  root.style.setProperty("--sve-builder-image", cssUrl(builderImageUrl()));
  root.style.setProperty("--sve-battle-image", cssUrl(battleImageUrl()));
  // The player's CSS comes last, so it overrides the built-in style.
  if (hasResource("theme.css") && !document.getElementById("sve-theme")) {
    const link = document.createElement("link");
    link.id = "sve-theme";
    link.rel = "stylesheet";
    link.href = "/theme.css";
    document.head.appendChild(link);
  }
}
