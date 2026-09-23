import type { PlayerId } from "../model/ids";
import type { CardMove, GameEvent } from "./types";
import { zoneVisibleTo } from "../view/visibility";

/**
 * Remove what `viewer` may not know from an event (CR 4.1.2). A zone move reveals the card
 * when it is visible in its source or destination zone; otherwise its identity is removed.
 * Ids of cards inside a deck are never exposed (they could reveal deck order).
 */
export function redactEvent(event: GameEvent, viewer: PlayerId): GameEvent {
  if (event.type !== "cardsMoved") return event;
  return { ...event, moves: event.moves.map((m) => redactMove(m, viewer)) };
}

function redactMove(m: CardMove, viewer: PlayerId): CardMove {
  const fromVisible = m.from === null || zoneVisibleTo(m.from.zone, m.from.player, viewer, m.from.faceUp);
  const toVisible = zoneVisibleTo(m.to.zone, m.to.player, viewer, m.to.faceUp);
  const out: CardMove = { ...m };
  if (m.from?.zone === "deck") out.card = null;
  if (m.to.zone === "deck") out.newCard = null;
  if (!fromVisible && !toVisible) {
    out.def = "";
    out.printing = "";
    out.before = null;
  }
  return out;
}
