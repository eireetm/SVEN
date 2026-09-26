// BP11-041 Words of Judgment — Runecraft spell, 0. 荒野・魔法使い.
// Select an enemy follower on the field. It loses all abilities for the rest of this turn and, if there
// are at least 6 cards with different base costs in your cemetery, you give your leader
// {[defense]}+2. (Without a target it can't be played; it loses its Last Words and "returned to hand"
// abilities too — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { distinctCostsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.loseAbilities(fx.targets[0]![0]!, "endOfTurn");
        if (distinctCostsInCemetery(fx.game, fx.controller) >= 6) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
