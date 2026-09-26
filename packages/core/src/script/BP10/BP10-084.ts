// BP10-084 Insatiable Desire — Abysscraft spell, 2. アルカナ・魔界・キラー.
// Activate Banish this card from your cemetery: Select an enemy follower on the field. Deal it 4 damage
// and draw a card. Activate only if there's a XIV. Luzen, Temperance on your field. (Valid in the
// cemetery — ruling, CR 10.3.5.)
// ----------
// Deal 2 damage to your leader. Draw 2 cards.
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        condition: (g, p) => onYourField(g, p, "XIV. Luzen, Temperance"),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          yield* fx.draw(1);
        },
      },
    ),
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
        yield* fx.draw(2);
      },
    }),
  ],
});
