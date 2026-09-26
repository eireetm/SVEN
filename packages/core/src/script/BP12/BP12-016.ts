// BP12-016 Fairy Officer — Forestcraft follower, 4, 3/4. 妖精.
// {[fanfare]} Select an enemy follower on the field. Put 2 Fairy tokens into your EX area, then deal the
// selected follower damage equal to the number of Pixie tokens in your EX area. (Also when a full EX
// area takes no Fairy — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { FAIRY, countIn, pixieToken } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY, FAIRY]);
        yield* fx.dealDamage(fx.targets[0]![0]!, countIn(fx.game, fx.controller, "ex", pixieToken));
      },
    }),
  ],
});
