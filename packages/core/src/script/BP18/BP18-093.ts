// BP18-093 Beryl, Dreameater (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field. Summon 2 Forest Bat tokens, then deal the selected follower damage equal
// to the number of cards named Forest Bat on your field. (Without a target nothing happens — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, named } from "../targets";
import { FOREST_BAT } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.summon([FOREST_BAT, FOREST_BAT]);
        const bats = fx.game.cards(fx.controller, "field").filter((id) => named(FOREST_BAT)(fx.game, id)).length;
        if (bats > 0) yield* fx.dealDamage(fx.targets[0]![0]!, bats);
      },
    }),
  ],
});
