// BP09-070_back Vania, Blood Queen — Abysscraft follower, 6/6. 吸血鬼・プリンセス・キラー. The back face
// of BP09-070 (CR 2.14; its Japanese text and traits are transcribed from the card, data/fixes.ts).
// Storm.
// While this card is on your field, any Forest Bat you play costs 1 less.
// Whenever a Forest Bat is put onto your field, select an enemy follower on the field and deal it 3
// damage.
import { defineCard, whenCardEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";
import { forestBat, forestBatsCostLess } from "./shared";

export default defineCard({
  keywords: ["storm"],
  field: { playCostOf: forestBatsCostLess },
  abilities: [
    whenCardEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { filter: forestBat },
    ),
  ],
});
