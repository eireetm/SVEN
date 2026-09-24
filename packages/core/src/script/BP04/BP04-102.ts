// BP04-102 Zoe, Princess of Goldenia (Evolved) — Havencraft, 4/4.
// On Evolve: Select an enemy follower on the field and banish it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
