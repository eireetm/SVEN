// BP14-049 Owl Receptionist — Runecraft follower, 3, 1/1. 宴楽・魔法生物・禁忌.
// {[fanfare]} The next Festive card that costs 3 or less or Mage card that costs 3 or less you play this turn
// costs 3 less. If there's a Yukishima, Master Biographer on your field, give your leader {[defense]}+2.
import { defineCard, fanfare } from "../helpers";
import { festiveOrMage3, namedOnYourField, YUKISHIMA } from "./shared";

export default defineCard({
  nextPlay: { festiveOrMage3: (g, card) => festiveOrMage3(g, card) },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("festiveOrMage3", 3);
        if (namedOnYourField(fx.game, fx.controller, YUKISHIMA)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
