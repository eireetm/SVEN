// BP12-075 Friends Forever — Abysscraft spell, 5. 機械・死霊術師・魔界.
// Select up to 2 Machina followers that cost a total of 5 or less in your cemetery and summon them.
// (元のコスト; selected one at a time, each time only those that still fit, like BP07-037.)
import { defineCard, selectWithinTotalCost, spell } from "../helpers";
import { and, isFollower } from "../targets";
import { machina } from "./shared";

const machinaFollower = and(isFollower, machina);

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const candidates = fx.game.cards(fx.controller, "cemetery").filter((id) => machinaFollower(fx.game, id));
        yield* fx.putOntoField(yield* selectWithinTotalCost(fx, candidates, 5, 2));
      },
    }),
  ],
});
