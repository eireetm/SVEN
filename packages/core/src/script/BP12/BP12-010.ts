// BP12-010 Windfall Fay — Forestcraft follower, 1, 2/2. 妖精.
// Whenever you play a card during your turn, if it's the 3rd you've played this turn, give your leader
// {[defense]}+1. If it’s the 5th, draw a card.
// (It counts every card played this turn, also before this card entered; this card itself isn't on
// the field yet when it is played; evolving is not playing — rulings. The count is the one when the
// card was played, CR 10.6.2.7.)
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { AutomaticAbility } from "../types";
import { defineCard } from "../helpers";

/** "Whenever you play a card during your turn, if it's the [n]th you've played this turn". */
const nthCardPlayed = (n: number, resolve: (fx: EffectContext) => Proc<void>): AutomaticAbility => ({
  kind: "automatic",
  timing: "other",
  trigger: (e, me, game) =>
    !me.lookBack &&
    e.type === "cardPlayed" &&
    e.player === me.controller &&
    game.activePlayer === me.controller &&
    game.playedThisTurn(me.controller) === n,
  resolve,
});

export default defineCard({
  abilities: [
    nthCardPlayed(3, function* (fx) {
      yield* fx.giveLeaderDefense(fx.controller, 1);
    }),
    nthCardPlayed(5, function* (fx) {
      yield* fx.draw(1);
    }),
  ],
});
