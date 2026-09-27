// CSD03a-007 Flash Shield, Iseult — Swordcraft spell, 1. ヴァンガード・ロイヤルパラディン. {[quick]}
// Choose one. (1) Select an enemy follower on the field and deal it 2 damage. (2) Discard a Royal Paladin card: Select an enemy
// follower on the field. Deal it 3 damage and give your leader {[defense]}+2. (Without an enemy follower neither can be chosen —
// ruling; the cost is paid when the option resolves, CR 10.4.7.5, as CP03-014.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { royalPaladin } from "../CP03/shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      modes: [
        {
          id: "1",
          label: "Deal 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        {
          id: "2",
          label: "Discard a Royal Paladin card: 3 damage to an enemy follower, and your leader +2",
          targets: [enemyFollower()],
          cost: discardA(royalPaladin),
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
      ],
    }),
  ],
});
