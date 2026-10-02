// Small screens (a phone held sideways): the card panel of a game becomes a drawer, the table packs
// tighter (board/layout.ts), and the menus shrink (styles/app.css, the same media query). Touch screens of any size (a
// tablet keeps the wide layout) are used with fingers: useTouch.
import { useSyncExternalStore } from "react";

export const COMPACT_QUERY = "(max-height: 560px), (max-width: 760px)";

/** A touch screen as the main way to point (a phone, a tablet), whatever its size. */
export const TOUCH_QUERY = "(pointer: coarse)";

const query = (q: string): MediaQueryList | null => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q) : null);

/** Whether a media query matches now (follows resizing and turning the device). */
function useMedia(q: string): boolean {
  return useSyncExternalStore(
    (listener) => {
      const list = query(q);
      list?.addEventListener("change", listener);
      return () => list?.removeEventListener("change", listener);
    },
    () => query(q)?.matches ?? false,
  );
}

/** Whether the screen is small (the phone layout). */
export function useCompact(): boolean {
  return useMedia(COMPACT_QUERY);
}

/**
 * Whether the screen is used with fingers: the phone layout, or a touch screen of any size. A tablet keeps the wide
 * layout, but a tap removes a card from the deck (no right click), a long press reads a card, and the HTML drag and drop
 * of a mouse is off.
 */
export function useTouch(): boolean {
  const compact = useMedia(COMPACT_QUERY);
  const touch = useMedia(TOUCH_QUERY);
  return compact || touch;
}
