// CP02-006 Anastasia — Forestcraft follower, 5, 2/4. デレマス・クール.
// {[fanfare]} Recover 2 play points.
// Whenever you play a card during your turn, if it's the 3rd you've played this turn, recover 2 play points. If it's the
// 5th, give each follower on your field {[attack]}+1/{[defense]}+1.
// (Rulings: the cards played this turn count from the start of the turn, Anastasia included, but she is not on the field
// when she is played; evolving is not playing; the 5th card, a follower, is on the field when this resolves, and this
// resolves even if the 5th card returned her to the hand. The number of a played card is fixed when it is played, so this
// triggers only for the 3rd and the 5th.)
import type { AutomaticAbility } from "../types";
import { defineCard, fanfare } from "../helpers";

const playedThirdOrFifth: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  trigger: (e, me, game) => {
    if (me.lookBack || e.type !== "cardPlayed" || e.player !== me.controller || game.activePlayer !== me.controller) return false;
    const n = game.playedThisTurn(me.controller); // CR 10.6.2.7: this card is already counted (as for Combo, 13.2.1)
    return n === 3 || n === 5 ? [{ count: n }] : false;
  },
  *resolve(fx) {
    if (fx.data?.count === 3) yield* fx.recoverPlayPoints(2);
    else for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 1);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
      },
    }),
    playedThirdOrFifth,
  ],
});
