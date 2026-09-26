// BP08-014 Insane Dark Elf (Evolved) — Forestcraft follower, 5/5. エルフ族・キラー.
// Strike - Put a Fairy Wisp token into your EX area.
// During your turn, whenever this follower deals combat damage, refresh it. (Not attack damage to a
// leader — ruling, CR 5.14.3.2.)
import { defineCard, strike, whenThisDealsCombatDamage } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp"]);
      },
    }),
    whenThisDealsCombatDamage(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
