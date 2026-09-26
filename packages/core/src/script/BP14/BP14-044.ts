// BP14-044 Orchestral Mage (Evolved) — Runecraft follower, 4/4. 宴楽・魔法使い・禁忌.
// On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number of Festive
// cards and/or Mage cards you've played this turn. (Each card counts once — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { festiveOrMageDef } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const count = fx.game.cardsPlayedThisTurn(fx.controller).filter((def) => festiveOrMageDef(fx.game, def)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * count);
      },
    }),
  ],
});
