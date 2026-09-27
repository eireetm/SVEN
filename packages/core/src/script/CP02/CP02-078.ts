// CP02-078 Aki Yamato (Evolved) — 6/6.
// On Evolve - Select up to 2 enemy followers on the field and deal them 5 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.targets[0] ?? [], 5);
      },
    }),
  ],
});
