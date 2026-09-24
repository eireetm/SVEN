// BP03-087 Mischievous Zombie (Evolved) — Abysscraft, 3/3.
// On Evolve: Select a Ghost on your field and give it Bane.
import { defineCard, onEvolve } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower({ filter: named("Ghost") })],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "bane");
      },
    }),
  ],
});
