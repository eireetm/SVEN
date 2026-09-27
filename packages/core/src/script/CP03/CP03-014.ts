// CP03-014 Emerald Shield, Paschal — Forestcraft spell, 1. ヴァンガード・アクアフォース.
// {[quick]}
// Choose one. (1) Select an enemy follower on the field and deal it 2 damage. (2) Discard an Aqua Force card: Select an enemy
// follower on the field. Deal it 3 damage and look at the top card of your deck. If it's a 1-cost Aqua Force follower, you may
// reveal it and add it to your hand. (Without an enemy follower neither can be chosen — ruling; the cost is paid when the
// option resolves, CR 10.4.7.5. 元のコスト.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { aquaForce, followerThat, mayTakeTopCard } from "./shared";

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
          label: "Discard an Aqua Force card: 3 damage, and a 1-cost Aqua Force follower from the top of your deck",
          targets: [enemyFollower()],
          cost: discardA(aquaForce),
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            yield* mayTakeTopCard(fx, (g, id) => followerThat(aquaForce)(g, id) && g.info(id).cost === 1);
          },
        },
      ],
    }),
  ],
});
