// BP03-012 Flower Princess — Forestcraft follower, 2, 2/3. プリンセス・童話.
// {[fanfare]} Put a Fairy into your EX area. Combo (3): Put a Fable counter on this card.
// Activate {[engage]}, remove a Fable counter: Deal 3 to an enemy follower.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy"]);
        if (fx.game.combo(fx.controller, 3)) yield* fx.addCounters(fx.self, "fable", 1);
      },
    }),
    activated(
      {
        engageSelf: true,
        custom: {
          canPay: (g, _c, self) => g.counters(self, "fable") >= 1,
          *pay(fx) {
            yield* fx.removeCounters(fx.self, "fable", 1);
          },
        },
      },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
