// BP09-106 Paradise Vanguard — Neutral follower, 3, 2/2. 天使.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there are at least 5 Angel cards in your cemetery, select an enemy follower on the
// field and banish it.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { angel, countIn } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ when: (g, c) => countIn(g, c, "cemetery", angel) >= 5 })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.banish([target]);
      },
    }),
  ],
});
