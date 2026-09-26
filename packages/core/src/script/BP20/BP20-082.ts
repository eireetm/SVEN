// BP20-082 Screaming and Loathing — Abysscraft spell, 2. 絶傑・死霊術師・魔界.
// Choose one. (1) Select an enemy follower on the field and deal it 3 damage. (2) Deal 2 damage to each enemy leader.
// (3) Draw a card, then discard a card. (4) Recover 1 play point. ((1) needs its target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
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
          id: "leader",
          label: "(2) 2 damage to each enemy leader",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          },
        },
        {
          id: "draw",
          label: "(3) Draw a card, then discard a card",
          *resolve(fx) {
            yield* fx.draw(1);
            yield* fx.discard(fx.controller, 1, 1);
          },
        },
        {
          id: "pp",
          label: "(4) Recover 1 play point",
          *resolve(fx) {
            yield* fx.recoverPlayPoints(1);
          },
        },
      ],
    }),
  ],
});
