// BP04-046 Freshman Lou — Runecraft follower, 2, 1/2. 魔法使い・学院.
// {[fanfare]} Search your deck for a spell that costs 1 play point, reveal it, and add it to your
// hand. (Printed cost; later printings say "original cost 1".)
import { defineCard, fanfare } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isSpell(fx.game, id) && fx.game.info(id).cost === 1);
      },
    }),
  ],
});
