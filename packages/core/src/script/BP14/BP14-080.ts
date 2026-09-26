// BP14-080 Room Service Demon — Abysscraft follower, 4, 4/4. 宴楽・魔界.
// {[fanfare]} Select an enemy follower on the field. Deal it 3 damage and, if there are 2 cards or less in your
// hand, recover 2 play points. If there are 0, deal 2 damage to its leader. (Both with 0 cards; not played
// without a target — rulings.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 3);
        const hand = fx.game.cards(fx.controller, "hand").length;
        if (hand <= 2) yield* fx.recoverPlayPoints(2);
        if (hand === 0) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
