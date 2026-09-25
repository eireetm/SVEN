// BP06-040 Curse Crafter (Evolved) — Runecraft follower, 3/3. 陰陽師.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 7
// spells and Onmyoji cards in your cemetery, deal 4 damage instead.
// Activate Bury a Shikigami follower: Select an enemy follower on the field and deal it 4 damage.
// For the rest of this turn, this card's Activate abilities can't be activated.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { curseCrafterAbility, sevenOnmyoji } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, sevenOnmyoji(fx.game, fx.controller) ? 4 : 2);
      },
    }),
    curseCrafterAbility(false),
  ],
});
