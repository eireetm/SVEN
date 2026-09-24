// BP03-101 Tin Soldier — Havencraft follower, 3, 3/4. 偶像・童話.
// {[fanfare]} If put onto the field from anywhere other than your hand, put a Fable counter on it.
// Activate, remove a Fable counter: Deal 2 to an enemy leader or follower.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.enteredFrom(fx.self) !== "hand") yield* fx.addCounters(fx.self, "fable", 1);
      },
    }),
    activated(
      {
        custom: {
          canPay: (g, _c, self) => g.counters(self, "fable") >= 1,
          *pay(fx) {
            yield* fx.removeCounters(fx.self, "fable", 1);
          },
        },
      },
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
  ],
});
