// BP02-007 Grand Archer Selwyn (Evolved) — 4/4.
// On Evolve: Select an enemy card that costs 3 play points or less on the field and destroy it.
// (The printed cost is referred to, not a changed play cost — ruling; CR 2.5.1, 10.4.4.1.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyCardOnField({ filter: costAtMost(3) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
