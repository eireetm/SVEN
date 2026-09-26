// BP14-082 Silvernail Markswoman — Abysscraft follower, 2, 3/2. 吸血鬼・キラー.
// {[evolve]} {[cost05]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field. Deal it 2 damage and discard a card. (Not played without a
// target — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(5),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
