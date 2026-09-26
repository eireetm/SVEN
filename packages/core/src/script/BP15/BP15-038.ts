// BP15-038 Raio, Truthful Elimination — Runecraft follower, 9, 6/6. 絶傑・魔法使い.
// When playing this, bury 3 Mage followers that cost 2 or more: This costs 9 less to play. (Followers on your
// field, 元のコスト; CR 10.4.7.3. Their "when you play a Mage card" abilities don't see this — ruling.)
// ----------
// {[fanfare]} Look at the top 3 cards of your deck. You may put one of them into your EX area. Put the rest on the
// bottom of your deck in any order.
// Activate Discard a Raio, Omen of Truth: Select an enemy follower on the field. Deal it 9 damage and put an Ersatz
// Elimination token into your EX area. (Not activatable without a target — ruling.)
import { buryFromYourField, discardA } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtLeast, enemyFollower, isFollower, named } from "../targets";
import { mage } from "./shared";

export default defineCard({
  playOptions: [
    {
      id: "bury3",
      label: "Bury 3 Mage followers (2 or more) on your field: costs 9 less",
      ...buryFromYourField(and(isFollower, mage, costAtLeast(2)), 3),
      freesFieldSlots: 3,
      costDelta: -9,
    },
  ],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: () => true, to: "ex" });
      },
    }),
    activated(
      { custom: discardA(named("Raio, Omen of Truth")) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 9);
          yield* fx.tokensToEx(["Ersatz Elimination"]);
        },
      },
    ),
  ],
});
