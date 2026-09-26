// BP20-089 Devotee of Entwining — Abysscraft follower, 3, 3/3. 絶傑・死霊術師・魔界.
// {[fanfare]} Choose one. (1) Select an enemy follower on the field and deal it 3 damage. (2) Deal 1 damage to each enemy
// leader and enemy follower on the field. (3) Draw a card. ((1) needs its target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
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
          id: "all",
          label: "(2) 1 damage to each enemy leader and follower",
          *resolve(fx) {
            const opponent = fx.game.opponent(fx.controller);
            yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], 1);
          },
        },
        {
          id: "draw",
          label: "(3) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
