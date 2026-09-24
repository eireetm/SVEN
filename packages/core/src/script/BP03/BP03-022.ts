// BP03-022 Maisy, Red Riding Hood — Swordcraft follower, 2, 1/1. 暗殺者・童話.
// {[fanfare]} If another Fable follower is on your field, put a Fable counter on this card.
// {[act]} {[cost01]}, {[engage]}, remove a Fable counter: Destroy an enemy follower.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

const otherFable = (g: GameReader, self: CardId) =>
  g.followers(g.controller(self)).some((id) => id !== self && hasTrait("童話")(g, id));

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (otherFable(fx.game, fx.self)) yield* fx.addCounters(fx.self, "fable", 1);
      },
    }),
    activated(
      {
        playPoints: 1,
        engageSelf: true,
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
