// BP09-109 Tsukuyomi — Neutral follower, 2, 3/2. 大神・キラー.
// Rush.
// Whenever this card becomes engaged, deal 1 damage to each enemy leader. If there's an Amaterasu on
// your field, deal 2 damage instead. (Also when it attacks — ruling.)
import { defineCard, whenThisBecomesEngaged } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    whenThisBecomesEngaged({
      *resolve(fx) {
        const damage = onYourField(fx.game, fx.controller, "Amaterasu") ? 2 : 1;
        yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], damage);
      },
    }),
  ],
});
