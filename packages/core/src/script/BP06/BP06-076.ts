// BP06-076 Shuten-Doji — Abysscraft follower, 3, 1/4. 妖怪.
// {[evolve]} {[cost01]}: Evolve this follower.
// Bane.
// {[fanfare]} Banish 2 Yokai cards from your cemetery: Evolve this follower. (Not this turn's evolve
// ability, CR 8.3.2.1 — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "cemetery").filter((id) => hasTrait("妖怪")(g, id)).length >= 2,
        *pay(fx) {
          const yokai = fx.game.cards(fx.controller, "cemetery").filter((id) => hasTrait("妖怪")(fx.game, id));
          yield* fx.banish(yield* fx.chooseCards(yokai, 2, 2));
        },
      },
      *resolve(fx) {
        yield* fx.evolve(fx.self);
      },
    }),
  ],
});
