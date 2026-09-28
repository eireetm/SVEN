// Pressing a card on the table: a click (the pointer barely moves) or a drag — a card from the hand or EX area onto your mat
// plays it, a follower onto an enemy target attacks. What may be dragged, and where to, comes from the decision's actions.
import type { PointerEvent } from "react";
import type { CardId } from "@sve/core";
import { setDrag } from "../interaction";

const DRAG_START = 6;

export interface PointerOptions {
  card: CardId;
  /** What dragging this card does, or null if it can't be dragged. */
  drag: "play" | "attack" | null;
  /** A card an attack drag may be dropped on. */
  isTarget: (card: CardId) => boolean;
  onClick: (box: DOMRect) => void;
  /** The drag ended over a place that takes it: a target card, or "field" (your mat) for a play. */
  onDrop: (over: CardId | "field") => void;
}

/** What is under the point that the drag could drop on. */
function dropAt(x: number, y: number, options: PointerOptions): CardId | "field" | null {
  for (const element of document.elementsFromPoint(x, y)) {
    if (!(element instanceof HTMLElement)) continue;
    if (options.drag === "play" && element.closest("[data-drop='play']")) return "field";
    if (options.drag === "attack") {
      const card = element.closest<HTMLElement>("[data-card]")?.dataset.card;
      if (card && options.isTarget(card)) return card;
    }
  }
  return null;
}

/** Follow one press of a card until the button is released. */
export function pressCard(e: PointerEvent<HTMLElement>, options: PointerOptions): void {
  if (e.button !== 0) return;
  e.preventDefault();
  const box = e.currentTarget.getBoundingClientRect();
  const startX = e.clientX;
  const startY = e.clientY;
  let dragging = false;
  let over: CardId | "field" | null = null;
  const move = (ev: globalThis.PointerEvent) => {
    if (!dragging) {
      if (!options.drag || Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_START) return;
      dragging = true;
    }
    over = dropAt(ev.clientX, ev.clientY, options);
    setDrag({ card: options.card, kind: options.drag!, x: ev.clientX, y: ev.clientY, over });
  };
  const stop = (ev: globalThis.PointerEvent | KeyboardEvent) => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    window.removeEventListener("keydown", escape);
    const cancelled = ev.type === "pointercancel" || ev.type === "keydown";
    if (dragging) {
      setDrag(null);
      if (!cancelled && over) options.onDrop(over);
    } else if (!cancelled) {
      options.onClick(box);
    }
  };
  const escape = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") stop(ev);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
  window.addEventListener("keydown", escape);
}
