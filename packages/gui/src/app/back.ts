// "Back" (the Android back button): closes what was opened last and is still open (a drawer, a window, a
// menu), else goes back one screen. Each such thing registers here while it is open; the screens register going back.
import { useEffect, useRef } from "react";

const stack: { close: () => void }[] = [];

/** Register a way back; the returned function removes it. The last one registered is used first. */
export function pushBack(close: () => void): () => void {
  const entry = { close };
  stack.push(entry);
  return () => {
    const i = stack.lastIndexOf(entry);
    if (i >= 0) stack.splice(i, 1);
  };
}

/** Go back once: true if something closed or a screen went back, false if there was nothing (the main menu). */
export function goBack(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.close();
  return true;
}

/** While `active`, "back" calls `onBack` (the latest one given). */
export function useBack(active: boolean, onBack: () => void): void {
  const latest = useRef(onBack);
  latest.current = onBack;
  useEffect(() => (active ? pushBack(() => latest.current()) : undefined), [active]);
}
