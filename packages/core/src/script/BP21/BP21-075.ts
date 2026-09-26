// BP21-075 Galom, Empress Fist — Abysscraft follower, 3, 3/3. 魔界・学院.
// Whenever you roll a 6-sided die, select an enemy follower on the field and deal it damage equal to the number you roll.
// Whenever you roll a 6-sided die, if you roll a 6, deal 4 damage to each enemy leader.
// {[fanfare]} Roll a 6-sided die. (Each roll triggers both abilities, each with its own result — rulings, CR 5.20.)
import { defineCard, fanfare, whenYouRollADie } from "../helpers";
import { enemyFollower } from "../targets";
import { rolled } from "./shared-abyss";

export default defineCard({
  abilities: [
    whenYouRollADie({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, rolled(fx));
      },
    }),
    whenYouRollADie({
      *resolve(fx) {
        if (rolled(fx) === 6) yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 4);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.rollDie();
      },
    }),
  ],
});
