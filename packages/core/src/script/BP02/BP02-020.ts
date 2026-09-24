// BP02-020 Alexander — Swordcraft follower, 6, 5/9.
// Rush. Assail.
// During your turn, whenever this follower deals combat damage, refresh it.
// (Damage to a leader is not combat damage — ruling; CR 5.14.3.2, 5.4.)
import { defineCard, whenThisDealsCombatDamage } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    whenThisDealsCombatDamage(
      {
        *resolve(fx) {
          yield* fx.refresh([fx.self]);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
