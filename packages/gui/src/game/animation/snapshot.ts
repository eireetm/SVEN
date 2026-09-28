// Where the table's cards and zones were just before an update is shown: the starting points of the animations (a card
// gets a new id in each zone, CR 4.1.4, so its old element is found through the move's old id).
import type { CardId } from "@sve/core";

export interface CardShot {
  rect: DOMRect;
  /** The element as it was (kept after React removes it, to copy its picture). */
  element: HTMLElement;
  /** Its card width (the CSS variable --w), for a copy outside the table. */
  width: string;
}

export interface Snapshot {
  cards: Map<CardId, CardShot>;
  /** Zone anchors by "player:zone" ("0:hand", "1:cemetery", ...) and "resolution". */
  zones: Map<string, DOMRect>;
}

let pending: Snapshot | null = null;

/** Remember the table as it is now (called just before an update replaces it). */
export function captureTable(): void {
  if (!document.querySelector(".sve-table")) {
    pending = null;
    return;
  }
  const cards = new Map<CardId, CardShot>();
  for (const element of document.querySelectorAll<HTMLElement>(".sve-table [data-card]")) {
    const id = element.dataset.card!;
    if (!cards.has(id)) cards.set(id, { rect: element.getBoundingClientRect(), element, width: getComputedStyle(element).getPropertyValue("--w") });
  }
  const zones = new Map<string, DOMRect>();
  for (const element of document.querySelectorAll<HTMLElement>(".sve-table [data-zone]")) zones.set(element.dataset.zone!, element.getBoundingClientRect());
  pending = { cards, zones };
}

/** The table as it was before the update being shown (once). */
export function takeSnapshot(): Snapshot | null {
  const snapshot = pending;
  pending = null;
  return snapshot;
}
