// BP17-T07 A Horrible Night — Abysscraft spell token, 1. 吸血鬼.
// This can't be played if you've played another A Horrible Night this turn.
// For the rest of this turn, whenever your leader loses defense, deal 1 damage to each enemy leader and give your leader
// {[defense]}+1. (A delayed trigger for each time, CR 10.7.5.1; three 1-damage options are three times — ruling.)
import { defineCard, spell, whenYourLeaderLosesDefense } from "../helpers";

export default defineCard({
  playableIf: (g, _self, p) => !g.cardsPlayedThisTurn(p).some((def) => g.db.get(def).name === "A Horrible Night"),
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.delay(1, "endOfTurn", undefined, { repeat: true });
      },
    }),
    {
      ...whenYourLeaderLosesDefense({
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      }),
      delayed: true,
    },
  ],
});
