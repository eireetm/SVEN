// BP13-118 Fallen Harpist — Neutral follower, 3, 3/4. 堕天使.
// {[fanfare]} Search your deck for a Neutral spell that costs 1 or less, reveal it, add it to your hand, then
// shuffle. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, isClass, isSpell } from "../targets";

const cheapNeutralSpell = and(isSpell, isClass("Neutral"), costAtMost(1));

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => cheapNeutralSpell(fx.game, id));
      },
    }),
  ],
});
