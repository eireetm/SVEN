// BP15-080 Yuzuki, Bloodlord — Abysscraft follower, 2, 2/2. 魔界.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and, if there are at least ten 2-cost cards in your cemetery,
// destroy it. (元のコスト.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn } from "./shared";
import { costs2 } from "./shared-abyss";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "cemetery", costs2) >= 10) yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
