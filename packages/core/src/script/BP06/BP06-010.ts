// BP06-010 Assault Jaguar — Forestcraft follower, 3, 4/1. 狩人.
// Rush.
// {[lastwords]} Look at the top 2 cards of your deck. You may reveal a Hunter card from among them
// and add it to your hand. Bury the rest. (Taking none buries both — ruling.)
import { defineCard, lastWords } from "../helpers";
import { hasTrait } from "../targets";
import { buryTheRest } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      *resolve(fx) {
        const top = fx.topCards(2);
        const chosen = yield* fx.selectCards(top.filter((id) => hasTrait("狩人")(fx.game, id)), 0, 1, fx.controller, top);
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
        yield* buryTheRest(fx, top);
      },
    }),
  ],
});
