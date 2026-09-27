// CSD03b-007 Wyvern Guard, Barri — Dragoncraft spell, 1. ヴァンガード・かげろう. {[quick]}
// Choose one. (1) Select an enemy follower on the field and deal it 2 damage. (2) Discard a Kagero card: Select an enemy follower on
// the field. Deal 3 damage to it and 1 damage to its leader. (The cost is paid when the option resolves, CR 10.4.7.5, as CP03-014.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { kagero } from "../CP03/shared";

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
          label: "Discard a Kagero card: 3 damage to an enemy follower and 1 to its leader",
          targets: [enemyFollower()],
          cost: discardA(kagero),
          *resolve(fx) {
            const target = fx.targets[0]![0]!;
            const leader = fx.game.leader(fx.game.controller(target));
            yield* fx.dealDamage(target, 3);
            yield* fx.dealDamage(leader, 1);
          },
        },
      ],
    }),
  ],
});
