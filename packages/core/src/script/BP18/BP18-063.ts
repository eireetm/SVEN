// BP18-063 Dragon-Eyed Secretary (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If there's a Draconic Duelist follower on your
// field with at least 4 attack, deal 3 damage instead.
// Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, give your leader{[defense]}+1.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { bigDuelist } from "./shared";
import { secretaryHeal } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const big = fx.game.followers(fx.controller).some((id) => bigDuelist(fx.game, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, big ? 3 : 2);
      },
    }),
    secretaryHeal,
  ],
});
