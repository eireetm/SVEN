// BP20-085 Supplicant of Entwining — Abysscraft follower, 2, 2/3. 絶傑・死霊術師・魔界.
// {[fanfare]} Choose one. (1) Select an enemy follower on the field and deal it 1 damage. (2) Deal 2 damage to each enemy
// leader. (3) Give your leader {[defense]}+2. ((1) needs its target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "damage",
          label: "(1) 1 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 1);
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
          id: "defense",
          label: "(3) Leader +2",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
      ],
    }),
  ],
});
