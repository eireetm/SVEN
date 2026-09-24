// BP02-023 Leonidas (Evolved) — 6/7.
// On Evolve: Select an enemy follower on the field. Deal 5 damage to it and to this follower
// (at the same time, CR 5.14).
// {[lastwords]} Summon a Leonidas's Resolve token.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamages([
          { target: fx.targets[0]![0]!, amount: 5 },
          { target: fx.self, amount: 5 },
        ]);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.summon(["Leonidas's Resolve"]);
      },
    }),
  ],
});
