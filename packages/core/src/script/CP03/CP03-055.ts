// CP03-055 Hades Hypnotist — Runecraft spell, 1. ヴァンガード・ペイルムーン.
// {[quick]}
// Choose one. (1) Select an enemy follower on the field and deal it 2 damage. (2) Discard a Pale Moon card: Select an enemy
// follower on the field. Deal it 3 damage and banish the top 3 cards of your deck. (Without an enemy follower neither can be
// chosen — ruling; the cost is paid when the option resolves, CR 10.4.7.5.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { paleMoon } from "./shared";

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
          label: "Discard a Pale Moon card: 3 damage and banish your top 3 cards",
          targets: [enemyFollower()],
          cost: discardA(paleMoon),
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            yield* fx.banish(fx.topCards(3));
          },
        },
      ],
    }),
  ],
});
