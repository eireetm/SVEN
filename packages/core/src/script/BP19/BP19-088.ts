// BP19-088 Fallen Sergeant — Abysscraft follower, 1, 2/2. 八獄・死者.
// {[lastwords]} Choose 1. (1) Select an enemy follower on the field. Necrocharge (10) - Deal it 2 damage. (2) Bury the top card
// of your deck. ((1) needs its target — ruling; Necrocharge as it resolves, CR 13.5.1.3.2.)
import { defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    lastWords({
      modes: [
        {
          id: "damage",
          label: "(1) Necrocharge (10): 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            if (fx.game.necrocharge(fx.controller, 10)) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        {
          id: "mill",
          label: "(2) Bury the top card of your deck",
          *resolve(fx) {
            yield* fx.mill(1);
          },
        },
      ],
    }),
  ],
});
