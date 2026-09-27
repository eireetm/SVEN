// SD03-008 Penguin Wizard — Runecraft follower, 2, 1/4. 魔法生物.
// {[evolve]} {[cost01]}: Evolve this follower.
// Activate {[engage]}, discard a spell: Draw a card.
import { activated, defineCard, evolveAbility } from "../helpers";
import { discardA } from "../costs";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    activated(
      { engageSelf: true, custom: discardA(isSpell) },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
