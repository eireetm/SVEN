// BP03-004 Magical Fairy, Lilac — Forestcraft follower, 3, 1/4. 妖精・童話.
// Activate {[engage]}: Put a Fable counter on this card.
// {[act]} {[cost01]}, remove a Fable counter: Destroy an enemy follower.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.addCounters(fx.self, "fable", 1);
        },
      },
    ),
    activated(
      {
        playPoints: 1,
        custom: {
          canPay: (g, _c, self) => g.counters(self, "fable") >= 1,
          *pay(fx) {
            yield* fx.removeCounters(fx.self, "fable", 1);
          },
        },
      },
      { targets: [enemyFollower()], *resolve(fx) { yield* fx.destroy(fx.targets[0]!); } },
    ),
  ],
});
