// ECP02-038 Fumika Sagisawa [Cinderella Girl] (Evolved) — 3/3.
// On Evolve - Choose 1. (1) Select an enemy follower on the field and deal it 2 damage. (2) {[cost04]}, bury this: Search your deck
// for a follower with "Fumika Sagisawa" in its name, summon it, then shuffle. (Option (2) does nothing unless its cost is paid when
// it resolves, CR 10.4.7.5.)
import { allCosts, buryThis, playPointsCost } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { followerNamed } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "damage",
          label: "Deal 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        {
          id: "search",
          label: 'Pay 4 and bury this: summon a follower with "Fumika Sagisawa" in its name from your deck',
          cost: allCosts(playPointsCost(4), buryThis),
          *resolve(fx) {
            yield* fx.search((id) => followerNamed("Fumika Sagisawa")(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
