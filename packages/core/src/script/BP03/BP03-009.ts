// BP03-009 Gerbera Bear — Forestcraft follower, 2, 2/2. 植物族・獣.
// {[evolve]} {[cost01]}: Evolve.
// Whenever a card on your field is returned to hand, give your leader +1 defense.
import type { GameEvent } from "../../events/types";
import type { TriggerSubject } from "../types";
import { defineCard, evolveAbility } from "../helpers";

function returned(e: GameEvent, me: TriggerSubject) {
  if (e.type !== "cardsMoved") return [];
  // One trigger per card returned, including this card (look-back, CR 10.7.4). A card is either
  // still on the field or the card that just left, so the two scans do not both see it.
  return e.moves
    .filter((m) => m.from?.zone === "field" && m.from.player === me.controller && m.to.zone === "hand")
    .map(() => ({}));
}

export default defineCard({
  abilities: [
    evolveAbility(1),
    {
      kind: "automatic",
      timing: "other",
      trigger: returned,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    },
  ],
});
