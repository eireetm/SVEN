// BP21-022 Yurius, Levin Authority — Swordcraft follower, 3, 3/4. 貴族・レヴィオン.
// {[fanfare]} Reveal 2 Levin cards from your hand: Choose 1 of the following. If there are at least 5 Levin cards in your
// cemetery, choose up to 3 instead. (1) Select an enemy follower on the field and destroy it. (2) Deal 3 damage to each enemy
// leader. (3) Draw 2 cards and discard a card. (Each option once; targets when it is played; (1) needs its target — rulings;
// CR 10.4.7.4, 5.18.)
import { revealFromHand } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { levin, levinsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: revealFromHand(levin, 2),
      modeCount: (g, c) => (levinsInCemetery(g, c) >= 5 ? 3 : 1),
      modes: [
        {
          id: "destroy",
          label: "(1) Destroy an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "leader",
          label: "(2) 3 damage to each enemy leader",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
          },
        },
        {
          id: "draw",
          label: "(3) Draw 2, discard a card",
          *resolve(fx) {
            yield* fx.draw(2);
            yield* fx.discard(fx.controller, 1, 1);
          },
        },
      ],
    }),
  ],
});
