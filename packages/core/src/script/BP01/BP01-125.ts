// BP01-125 Razory Claw — Abysscraft spell, 2. {[quick]}
// Deal 2 damage to your leader. // Select an enemy leader or enemy follower on the field and deal
// it 3 damage. (Both leaders at 0 -> draw — ruling, CR 1.2.2.)
import { defineCard, spell } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
