// A long press on a card with a finger: the card panel's drawer opens and shows it (the press already
// pointed at the card, CardTile). That press then neither clicks nor drags (board/pointer.ts; the click that follows is
// swallowed: a tile of the deck builder isn't added or removed), and the browser's own long-press menu stays away.
import { markLongPress } from "./board/pointer";
import { setDetailsOpen } from "./details";

const HOLD_MS = 480;
const SLOP = 8;

/** Watch the presses inside `root`; returns the function that stops it. */
export function installLongPress(root: HTMLElement): () => void {
  let timer: number | null = null;
  let start: { x: number; y: number; id: number } | null = null;
  const clear = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    start = null;
  };
  const down = (e: PointerEvent) => {
    clear();
    if (e.pointerType !== "touch" || !(e.target instanceof Element) || !e.target.closest("[data-card], [data-printing]")) return;
    start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    timer = window.setTimeout(() => {
      timer = null;
      markLongPress();
      setDetailsOpen(true);
      swallowClick();
    }, HOLD_MS);
  };
  const move = (e: PointerEvent) => {
    if (start && e.pointerId === start.id && Math.hypot(e.clientX - start.x, e.clientY - start.y) > SLOP) clear();
  };
  const menu = (e: Event) => e.preventDefault();
  // The click the lifted finger makes, right after a long press.
  const swallowClick = () => {
    const swallow = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 800);
  };
  root.addEventListener("pointerdown", down, true);
  window.addEventListener("pointermove", move, true);
  window.addEventListener("pointerup", clear, true);
  window.addEventListener("pointercancel", clear, true);
  root.addEventListener("contextmenu", menu);
  return () => {
    clear();
    root.removeEventListener("pointerdown", down, true);
    window.removeEventListener("pointermove", move, true);
    window.removeEventListener("pointerup", clear, true);
    window.removeEventListener("pointercancel", clear, true);
    root.removeEventListener("contextmenu", menu);
  };
}
