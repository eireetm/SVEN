// BP16-049 Snowman Army — Runecraft spell, 2. 魔法使い・魔法生物.
// Select an enemy follower on the field and change its attack and defense to 1. Spellchain (10) - It loses all
// abilities. (Its Last Words and "returned to hand" abilities don't trigger; given traits stay; also for a 1/1 —
// rulings.)
import { changeStatsTo, defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* changeStatsTo(fx, target, { attack: 1, defense: 1 });
        if (fx.game.spellchain(fx.controller, 10) && fx.game.card(target)?.zone === "field") yield* fx.loseAbilities(target, null);
      },
    }),
  ],
});
