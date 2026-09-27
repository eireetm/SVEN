// SD05-006 Night Horde — Abysscraft spell, 3. 吸血鬼.
// Summon 2 Forest Bat tokens.
// Select an enemy follower on the field and deal it X damage. X equals the number of Forest Bat tokens on your field. (The follower
// is selected when it is played: not playable without one; playable with a full field — rulings, CR 10.6.2.3.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { BAT, forestBat } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.summon([BAT, BAT]);
        const bats = fx.game.cards(fx.controller, "field").filter((id) => forestBat(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, bats);
      },
    }),
  ],
});
