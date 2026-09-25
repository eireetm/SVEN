// BP09-090_back Ceryneian Darkhind — Havencraft follower, 5/5. 信仰・獣・キラー. The back face of
// BP09-090 (CR 2.14; its Japanese text and traits are transcribed from the card, data/fixes.ts).
// Bane.
// On Evolve - Bury an amulet: Select an enemy leader or enemy follower on the field and deal it 4
// damage. (An amulet on your field, CR 10.4.3.)
import { buryFromYourField } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyLeaderOrFollower, isAmulet } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    onEvolve({
      cost: buryFromYourField(isAmulet),
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
