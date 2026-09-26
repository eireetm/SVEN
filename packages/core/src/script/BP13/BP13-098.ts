// BP13-098 Gods' Loving Smite — Havencraft spell, 2. 信仰.
// As an additional cost to play this card, you may bury an amulet. (An amulet on your field, CR 10.4.3.)
// ----------
// Select an enemy follower on the field and deal it 3 damage. If you paid this card's additional cost,
// deal 5 damage instead.
import { buryFromYourField } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  playOptions: [{ id: "bury", label: "Bury an amulet", ...buryFromYourField(isAmulet) }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.playOption === "bury" ? 5 : 3);
      },
    }),
  ],
});
