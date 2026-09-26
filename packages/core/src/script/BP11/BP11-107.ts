// BP11-107 Goblin Queen — Neutral follower, 2, 2/3. ゴブリン.
// {[fanfare]} Look at the top 5 cards of your deck. You may reveal a Goblinoid card from among them and
// add it to your hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]}, banish 3 Goblinoid cards from your cemetery: Select an enemy follower on the
// field. Destroy it and deal 3 damage to its leader. (Valid on the field — ruling.)
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

const goblinoid = hasTrait("ゴブリン");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: goblinoid, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, custom: banishFromYour(["cemetery"], goblinoid, 3) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const leader = fx.game.leader(fx.game.controller(target));
          yield* fx.destroy([target]);
          yield* fx.dealDamage(leader, 3);
        },
      },
    ),
  ],
});
