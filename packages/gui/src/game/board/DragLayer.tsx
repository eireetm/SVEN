// What follows the pointer during a drag: the card being played, or an arrow from the attacking follower.
import { createPortal } from "react-dom";
import type { GameUpdate } from "../../engine/protocol";
import { findCard } from "../../engine/view-utils";
import { CardTile } from "../card/CardTile";
import { useInteraction } from "../interaction";
import { Arrow, cardCenter } from "./Arrow";

export function DragLayer({ update }: { update: GameUpdate }) {
  const drag = useInteraction((s) => s.drag);
  if (!drag) return null;
  const card = findCard(update.view, drag.card);
  if (!card) return null;
  if (drag.kind === "attack") {
    const from = cardCenter(drag.card);
    if (!from) return null;
    const to = typeof drag.over === "string" && drag.over !== "field" ? (cardCenter(drag.over) ?? { x: drag.x, y: drag.y }) : { x: drag.x, y: drag.y };
    return <Arrow from={from} to={to} variant="drag" />;
  }
  return createPortal(
    <div className={`sve-drag-ghost${drag.over ? " sve-drag-ok" : ""}`} style={{ left: drag.x, top: drag.y }}>
      <CardTile card={card} side={update.view.players[card.controller]} />
    </div>,
    document.body,
  );
}
