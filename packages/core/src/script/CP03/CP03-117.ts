// CP03-117 Battle Sister, Chocolat — Havencraft spell, 1. ヴァンガード・オラクルシンクタンク.
// {[quick]}
// Choose one. (1) Select an enemy follower on the field and deal it 2 damage. (2) Discard an Oracle Think Tank card: Select an
// enemy follower on the field. Deal it 3 damage and look at the top 2 cards of your deck. Put any number of them on the top of
// your deck in any order. Put the rest on the bottom in any order. (Without an enemy follower neither can be chosen — ruling; the
// cost is paid when the option resolves, CR 10.4.7.5.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { arrangeTop, oracleThinkTank } from "./shared";

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
          label: "Discard an Oracle Think Tank card: 3 damage and arrange your top 2 cards",
          targets: [enemyFollower()],
          cost: discardA(oracleThinkTank),
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            yield* arrangeTop(fx, 2);
          },
        },
      ],
    }),
  ],
});
