// CP03-078 Lizard Soldier, Ganlu — Dragoncraft follower, 1, 1/2. ヴァンガード・かげろう. Stand Trigger.
// Activate {[engage]}: Select an enemy follower on the field and deal it 1 damage. Activate only if there's another Kagero
// follower on your field.
// {[act]} {[cost02]}: Refresh this card. For the rest of this turn, this follower can't attack enemies. (Also when it is
// reserved — ruling.)
// ----------
// (If this card is revealed by a drive check, refresh a follower on your field. For the rest of this turn, it can't attack
// enemy leaders.) (Resolved by the engine.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { followerThat, kagero } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        condition: (g, c, self) => g.followers(c).some((id) => id !== self && followerThat(kagero)(g, id)),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
    activated(
      { playPoints: 2 },
      {
        *resolve(fx) {
          yield* fx.refresh([fx.self]);
          yield* fx.cannotAttack(fx.self, "endOfTurn");
        },
      },
    ),
  ],
});
