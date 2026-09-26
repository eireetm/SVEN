// BP15-011 Cryptid Keeper (Evolved) — Forestcraft follower, 4/1. 狩人・獣.
// On Evolve - Select an enemy follower on the field. Deal it 4 damage, return this to its owner's hand, and
// recover 3 play points. (Not played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.returnToHand([fx.self]);
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
