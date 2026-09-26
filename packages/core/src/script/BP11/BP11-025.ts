// BP11-025 Stalwart Slinger — Swordcraft follower, 6, 3/3. 兵士.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy card on the field and destroy it.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyCardOnField()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
