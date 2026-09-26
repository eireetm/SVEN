// BP08-065 Geovore — Dragoncraft follower, 6, 4/6. 竜族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Bury the top 2 cards. If a non-Dragoncraft card is then in your cemetery, give your
// leader +2 defense and draw a card (CR 5.10, 5.27, 12.4.3).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
        if (fx.game.cards(fx.controller, "cemetery").some((id) => !isClass("Dragoncraft")(fx.game, id))) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
          yield* fx.draw(1);
        }
      },
    }),
  ],
});
