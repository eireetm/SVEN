// BP05-113 Craving's Splendor — Neutral spell, 3. 絶傑.
// Quick.
// If there is a Gilnelise, Omen of Craving on your field, this card costs 3 less to play from the EX
// area.
// Select an enemy follower on the field. Deal it 4 damage and give your leader {[defense]}+1.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { cravingDiscount } from "./shared";

export default defineCard({
  keywords: ["quick"],
  playCost: cravingDiscount,
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
