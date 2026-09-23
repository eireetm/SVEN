// BP01-030 Shadowed Assassin (Evolved) — 5/5.
// On Evolve: Select an engaged enemy follower and destroy it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: (g, id) => g.card(id)!.engaged })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
