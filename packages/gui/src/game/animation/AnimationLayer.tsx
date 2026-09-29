// Stage 4: the table moves with the game. Each update's events (already hidden for the viewer) say what happened; the
// snapshot says where things were. Cards fly from their old places to their new ones, damage and healing rise as
// numbers, evolving followers turn over, attackers lean in, and a card the opponent plays is shown large for a moment.
// Purely cosmetic: the table itself always shows the engine's latest view.
import type { CardId } from "@sve/core";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../../app/settings";
import { onBeforeUpdate } from "../../app/store";
import type { CardInfo, GameUpdate } from "../../engine/protocol";
import { CardTile } from "../card/CardTile";
import { flip, floatText, flyIn, flyOut, lunge, popIn, shake } from "./effects";
import { planFlights } from "./plan";
import { captureTable, takeSnapshot, type Snapshot } from "./snapshot";

onBeforeUpdate(captureTable);

const cardElement = (id: CardId): HTMLElement | null => document.querySelector<HTMLElement>(`.sve-table [data-card="${CSS.escape(id)}"]`);

const zoneBox = (key: string | null): DOMRect | undefined =>
  key ? document.querySelector<HTMLElement>(`.sve-table [data-zone="${CSS.escape(key)}"]`)?.getBoundingClientRect() : undefined;

function centerOf(id: CardId, snapshot: Snapshot): { x: number; y: number } | null {
  const box = cardElement(id)?.getBoundingClientRect() ?? snapshot.cards.get(id)?.rect;
  return box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : null;
}

/** Start the animations of one update; returns the card the opponent played, to show large. */
function animate(update: GameUpdate, snapshot: Snapshot): CardInfo | null {
  for (const flight of planFlights(update.log)) {
    const { origin } = flight;
    const from = (origin.card ? snapshot.cards.get(origin.card)?.rect : undefined) ?? (origin.zone ? snapshot.zones.get(origin.zone) : undefined);
    const element = flight.card ? cardElement(flight.card) : null;
    if (element) {
      if (from) flyIn(element, from);
      else popIn(element);
      continue;
    }
    // Not shown where it went (a deck, a face-down pile, the evolve zone): its old picture goes there.
    const source = origin.card ? snapshot.cards.get(origin.card) : undefined;
    const to = zoneBox(flight.to);
    if (source && to) flyOut(source, to);
  }
  let reveal: CardInfo | null = null;
  for (const entry of update.log) {
    const event = entry.event;
    switch (event.type) {
      case "damageDealt": {
        const at = centerOf(event.target, snapshot);
        if (at && event.amount > 0) floatText(at.x, at.y, `-${event.amount}`, "damage");
        const element = cardElement(event.target);
        if (element) shake(element);
        break;
      }
      case "leaderDefenseChanged": {
        // Damage shows with damageDealt; this is for healing and "+X" (CR 5.27).
        const leader = update.view.players[event.player].leader;
        const at = leader ? centerOf(leader.id, snapshot) : null;
        if (at && event.delta > 0) floatText(at.x, at.y, `+${event.delta}`, "heal");
        break;
      }
      case "attackDeclared": {
        const attacker = cardElement(event.attacker);
        const target = cardElement(event.target);
        if (attacker && target) lunge(attacker, target);
        break;
      }
      case "evolved": {
        const element = cardElement(event.card);
        if (element) flip(element);
        break;
      }
      case "cardPlayed":
        // A Quick card played at quick timing is shown by its announcement (board/QuickAnnouncement.tsx).
        if (event.player !== update.perspective && update.announcement?.played !== event.card) reveal = entry.cards[event.card] ?? { def: event.def, printing: null };
        break;
      default:
        break;
    }
  }
  return reveal;
}

export function AnimationLayer({ update }: { update: GameUpdate }) {
  const { animations } = useSettings();
  const [reveal, setReveal] = useState<{ card: CardInfo; seq: number } | null>(null);
  useLayoutEffect(() => {
    const snapshot = takeSnapshot();
    if (!animations || !snapshot || update.logReset) return;
    const played = animate(update, snapshot);
    if (played) setReveal({ card: played, seq: update.inputCount });
  }, [update, animations]);
  useEffect(() => {
    if (!reveal) return;
    const timer = window.setTimeout(() => setReveal(null), 1400);
    return () => window.clearTimeout(timer);
  }, [reveal]);
  const table = document.querySelector(".sve-table");
  if (!reveal || !table) return null;
  return createPortal(
    <div className="sve-play-reveal" key={reveal.seq}>
      <CardTile info={reveal.card} />
    </div>,
    table,
  );
}
