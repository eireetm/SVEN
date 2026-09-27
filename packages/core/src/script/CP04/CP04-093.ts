// CP04-093 Nozomi — Havencraft follower, 3, 1/3. プリコネ・カルミナ.
// {[ub]}{[fanfare]} Search your deck for an amulet, reveal it, add it to your hand, then shuffle. (Finding none, it is still
// executed — ruling.)
// Activate {[engage]} an amulet on your field: Select an enemy follower on the field and deal it 1 damage.
// Activate {[engage]} this, bury 3 amulets: Select an enemy follower on the field. Deal 3 damage to it and its leader. (Amulets on
// your field.)
import { buryFromYourField, engageYourCards } from "../costs";
import { activated, defineCard, fanfare, ub } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          yield* fx.search((id) => isAmulet(fx.game, id));
        },
      }),
    ),
    activated(
      { custom: engageYourCards(isAmulet, 1) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
    activated(
      { engageSelf: true, custom: buryFromYourField(isAmulet, 3) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamages([
            { target, amount: 3 },
            { target: fx.game.leader(fx.game.controller(target)), amount: 3 },
          ]);
        },
      },
    ),
  ],
});
