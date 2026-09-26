// BP20-039 Velharia, Heir to Truth (Evolved) — 1/3.
// On Evolve - Select an enemy follower on the field and destroy it.
// On Super Evolve - Select a 9-cost or less {[runecraft]} spell from your cemetery and put it into your EX area. It costs 3
// less to play this turn. (元のコスト.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { and, costAtMost, enemyFollower, inYourZone, isClass, isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    onSuperEvolve({
      targets: [inYourZone("cemetery", { filter: and(isSpell, isClass("Runecraft"), costAtMost(9)) })],
      *resolve(fx) {
        for (const id of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
  ],
});
