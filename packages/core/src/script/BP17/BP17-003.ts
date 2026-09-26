// BP17-003 Ladica, Verdant Claw (Evolved) — Forestcraft follower, 4/4. 自然・獣.
// On Evolve - Select an enemy follower on the field. Put a Naterran Great Tree token into your EX area, then deal the
// selected follower damage equal to the number of cards in your EX area named Naterran Great Tree.
// On Super-Evolve - Select an enemy follower on the field. Put a Naterran Great Tree token into your EX area, then deal
// the selected follower and its leader damage equal to the number of cards in your EX area named Naterran Great Tree.
// (Neither without a target — rulings.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, isTree, TREE } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
        yield* fx.dealDamage(fx.targets[0]![0]!, countIn(fx.game, fx.controller, "ex", isTree));
      },
    }),
    onSuperEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.tokensToEx([TREE]);
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], countIn(fx.game, fx.controller, "ex", isTree));
      },
    }),
  ],
});
