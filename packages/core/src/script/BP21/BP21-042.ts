// BP21-042 Grea, Crimson Promise (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 10 Academic cards in your
// cemetery, deal 4 damage instead and 1 damage to its leader. (Q10: the leader damage is under the condition too.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { academicsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (academicsInCemetery(fx.game, fx.controller) < 10) {
          yield* fx.dealDamage(target, 2);
          return;
        }
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 4);
        yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
