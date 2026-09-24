// BP03-089 Infernal Orchestration — Abysscraft spell, 1. 魔界.
// Deal 1 damage to your leader. The next time you put a follower onto your field this turn by
// playing it, give it +1/+1.
// A delayed trigger (CR 10.7.5): it triggers once (10.7.5.1), together with that follower's own
// Fanfare, and the player orders them; it ends with the turn. Two copies trigger twice, and a
// follower put onto the field by an ability does not count (rulings).
import type { GameEvent } from "../../events/types";
import type { TriggerSubject } from "../types";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";

function playedFollowerEntered(e: GameEvent, me: TriggerSubject, game: GameReader) {
  if (e.type !== "cardsMoved") return [];
  return e.moves
    .filter(
      (m) =>
        m.from?.zone === "resolution" &&
        m.reason === "resolve" && // CR 10.6.2.8.1 put onto the field by playing it
        m.to.zone === "field" &&
        m.to.player === me.controller &&
        m.newCard !== null &&
        game.card(m.newCard)?.zone === "field" &&
        game.info(m.newCard).type === "follower",
    )
    .map((m) => ({ card: m.newCard! }));
}

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        yield* fx.delay(1, "endOfTurn");
      },
    }),
    {
      kind: "automatic",
      timing: "other",
      delayed: true,
      trigger: playedFollowerEntered,
      *resolve(fx) {
        const id = fx.data?.card;
        if (id && fx.game.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 1);
      },
    },
  ],
});
