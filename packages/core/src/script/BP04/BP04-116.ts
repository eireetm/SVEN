// BP04-116 Zodiac Demon — Neutral follower, 6, 6/6. 大神・星神.
// Activate {[engage]}, discard a follower: Select an enemy follower on the field. Deal X damage to it
// and Y damage to its leader. X equals the discarded follower's cost. Y equals half of it, rounded
// up (e.g. 9 -> 5, 5 -> 3, 1 -> 1 — ruling). Without an enemy follower to select it cannot be
// activated (ruling).
import { activated, defineCard } from "../helpers";
import { enemyFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      {
        engageSelf: true,
        custom: {
          canPay: (g, c) => g.cards(c, "hand").some((id) => isFollower(g, id)),
          *pay(fx) {
            const followers = fx.game.cards(fx.controller, "hand").filter((id) => isFollower(fx.game, id));
            const [id] = yield* fx.chooseCards(followers, 1, 1);
            if (id === undefined) return;
            fx.memory.cost = fx.game.info(id).cost ?? 0;
            yield* fx.discardCards([id]);
          },
        },
      },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const x = Number(fx.memory.cost ?? 0);
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamages([
            { target, amount: x },
            { target: fx.game.leader(fx.game.controller(target)), amount: Math.ceil(x / 2) },
          ]);
        },
      },
    ),
  ],
});
