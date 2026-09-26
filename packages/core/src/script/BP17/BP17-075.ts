// BP17-075 Urias, Final Vampire (Evolved) — 4/4.
// On Evolve - Choose up to 3. (1) Select an enemy follower on the field. Deal 3 damage to it and 1 damage to your leader.
// (2) Deal 1 damage to your leader and each enemy follower on the field. (3) Deal 1 damage to your leader. Draw a card.
// (Each option once; (1) can't be chosen without a target — rulings, CR 5.18.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      modeCount: () => 3,
      modes: [
        {
          id: "damage",
          label: "(1) 3 damage to an enemy follower, 1 to your leader",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
          },
        },
        {
          id: "each",
          label: "(2) 1 damage to your leader and each enemy follower",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
            yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
          },
        },
        {
          id: "draw",
          label: "(3) 1 damage to your leader, draw a card",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
