// BP20-112 Mjerrabaine, Great Manifest (Evolved) — 4/4.
// At the start of your end phase, select an enemy follower on the field and, if there are 1 or less cards in your hand,
// destroy it.
// On Evolve - Put a Crest: Mjerrabaine, Great Manifest token into your EX area.
// On Super-Evolve - Select an enemy follower on the field. Destroy it and deal 2 damage to its leader.
import { atStartOfYourEndPhase, defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { oneOrLessInHand } from "./shared-neutral";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (oneOrLessInHand(fx.game, fx.controller)) yield* fx.destroy(fx.targets[0]!);
      },
    }),
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Crest: Mjerrabaine, Great Manifest"]);
      },
    }),
    onSuperEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
