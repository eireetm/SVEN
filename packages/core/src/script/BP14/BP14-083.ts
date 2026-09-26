// BP14-083 Silvernail Markswoman (Evolved) — Abysscraft follower, 5/4. 吸血鬼・キラー.
// On Evolve - Select an enemy follower on the field. Deal 4 damage to it and its leader, and discard a card.
// (Not played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 4);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
