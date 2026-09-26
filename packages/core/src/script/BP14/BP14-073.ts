// BP14-073 Paracelise, Demon of Greed (Evolved) — Abysscraft follower, 4/4. 宴楽・魔界.
// On Evolve - Select an enemy follower on the field. Deal 5 damage to it, 2 damage to its leader, give your
// leader {[defense]}+2, and put the top card of your deck into your EX area. (Not played without a target —
// ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamages([
          { target, amount: 5 },
          { target: fx.game.leader(fx.game.controller(target)), amount: 2 },
        ]);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.topToEx(1);
      },
    }),
  ],
});
