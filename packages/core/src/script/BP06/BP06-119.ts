// BP06-119 Bazooka Goblins — Neutral follower, 4, 3/3. ゴブリン.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Select an enemy card that costs 2 or less on the field and destroy it. (元のコスト.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost, enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [enemyCardOnField({ filter: costAtMost(2) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
