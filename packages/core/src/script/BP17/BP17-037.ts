// BP17-037 Isabelle, Intrepid Mage — Runecraft follower, 3, 3/3. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard a card: Choose 1. (1) Select an enemy follower on the field deal it 3 damage. (2) Draw a card. ((1)
// needs its target — ruling; CR 10.4.7.4.)
import { discardCardsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardCardsCost(1),
      modes: [
        {
          id: "damage",
          label: "(1) 3 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
        {
          id: "draw",
          label: "(2) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
