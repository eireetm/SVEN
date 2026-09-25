// BP09-038 Mysterian Wyrmist — Runecraft follower, 2, 2/2. 学院.
// {[evolve]} {[cost02]}: Evolve this follower into a Mysterian Whitewyrm or Mysterian Blackwyrm.
// Activate only if there are at least 5 Academic cards in your cemetery. (Either face of the
// double-faced BP09-039 — ruling, CR 4.6.4.)
// {[fanfare]} You may discard an Academic card. If you do, draw a card. Otherwise, put this card into
// your cemetery.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { academic, countIn } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2, {
      into: ["Mysterian Whitewyrm", "Mysterian Blackwyrm"],
      condition: (g, c) => countIn(g, c, "cemetery", academic) >= 5,
    }),
    fanfare({
      *resolve(fx) {
        const academics = fx.game.cards(fx.controller, "hand").filter((id) => academic(fx.game, id));
        const chosen = yield* fx.chooseCards(academics, 0, 1);
        if (chosen.length > 0) {
          yield* fx.discardCards(chosen);
          yield* fx.draw(1);
        } else if (fx.game.card(fx.self)?.zone === "field") {
          yield* fx.bury([fx.self]);
        }
      },
    }),
  ],
});
