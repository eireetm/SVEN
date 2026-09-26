// BP08-037 Prophetess of Creation — Runecraft follower, 10, 10/10. 魔法使い.
// When playing this card, banish 10 cards with different base costs ranging from 1 to 10 from your
// cemetery: This card costs 10 less to play.
// Ward. Aura.
// This card can't be destroyed by abilities. (It can still be destroyed by ability damage. Being put
// into the cemetery isn't destruction — ruling, CR 5.6.)
// Activate Discard this card: Draw a card. Discard a card. (Valid in the hand — ruling, CR 10.3.5.)
import { discardThis } from "../costs";
import { activated, defineCard } from "../helpers";

const COSTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default defineCard({
  keywords: ["ward", "aura"],
  cannotBeDestroyedByAbilities: true,
  playOptions: [
    {
      id: "tenCosts",
      label: "Banish one card of each base cost 1–10 from your cemetery: costs 10 less",
      costDelta: -10,
      canPay: (g, p) => COSTS.every((n) => g.cards(p, "cemetery").some((id) => g.info(id).cost === n)),
      *pay(fx) {
        const chosen = [];
        for (const n of COSTS) {
          const withCost = fx.game.cards(fx.controller, "cemetery").filter((id) => fx.game.info(id).cost === n);
          chosen.push(...(yield* fx.chooseCards(withCost, 1, 1)));
        }
        yield* fx.banish(chosen);
      },
    },
  ],
  abilities: [
    activated(
      { custom: discardThis },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
    ),
  ],
});
