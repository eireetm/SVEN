// Small screens (a phone held sideways; docs/android.md): the card panel of a game becomes a drawer, the table packs
// tighter (board/layout.ts), and the menus shrink (styles/app.css, the same media query).
import { useSyncExternalStore } from "react";

export const COMPACT_QUERY = "(max-height: 560px), (max-width: 760px)";

const query = (): MediaQueryList | null => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(COMPACT_QUERY) : null);

/** Whether the screen is small (follows resizing and turning the device). */
export function useCompact(): boolean {
  return useSyncExternalStore(
    (listener) => {
      const q = query();
      q?.addEventListener("change", listener);
      return () => q?.removeEventListener("change", listener);
    },
    () => query()?.matches ?? false,
  );
}
