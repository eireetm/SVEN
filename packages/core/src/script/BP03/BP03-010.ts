// BP03-010 Gerbera Bear (Evolved) — Forestcraft, 3/3.
// On Evolve: Search your deck for a Floral Breeze and add it to your hand.
// Whenever a card on your field is returned to hand, give your leader +1 defense.
import type { GameEvent } from "../../events/types";
import type { TriggerSubject } from "../types";
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

function returned(e: GameEvent, me: TriggerSubject) {
  if (e.type !== "cardsMoved") return [];
  return e.moves
    .filter((m) => m.from?.zone === "field" && m.from.player === me.controller && m.to.zone === "hand")
    .map(() => ({}));
}

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named("Floral Breeze")(fx.game, id));
      },
    }),
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
