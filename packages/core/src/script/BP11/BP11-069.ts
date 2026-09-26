// BP11-069 Iceschillendrig, Gilded Autocrat — Abysscraft follower, 5, 5/5. 荒野・死者・魔界.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there's no Magitrain on your field, summon one.
// Whenever this card becomes engaged, each opponent discards a card. (Also when an opponent's effect
// engages it — ruling.)
import { defineCard, evolveAbility, fanfare, whenThisBecomesEngaged } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => !onYourField(g, p, "Magitrain"),
      *resolve(fx) {
        yield* fx.summon(["Magitrain"]);
      },
    }),
    whenThisBecomesEngaged({
      *resolve(fx) {
        yield* fx.discard(fx.game.opponent(fx.controller), 1, 1);
      },
    }),
  ],
});
