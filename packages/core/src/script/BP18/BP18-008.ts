// BP18-008 Sprouting Retribution — Forestcraft spell, 4. 透京・植物族.
// This costs X less to play. X equals the number of faceup evolved Togh Keyoh followers in your evolve deck.
// ----------
// Select an enemy follower on the field. Deal 5 damage to it and 1 damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { faceupToghKeyoh } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => -faceupToghKeyoh(g, p),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 5);
        yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
