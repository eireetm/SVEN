// BP02-006 Grand Archer Selwyn — Forestcraft follower, 4, 3/3.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]}, Combo (4): Select an enemy follower on the field and deal it 5 damage.
// (CR 13.2.1.2: including this card.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ when: (g, c) => g.combo(c, 4) })],
      *resolve(fx) {
        const target = fx.targets[0]![0];
        if (target !== undefined) yield* fx.dealDamage(target, 5);
      },
    }),
  ],
});
