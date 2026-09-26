// BP10-052 Skewer — Runecraft spell, 3. チェス.
// Choose one. If there are at least 5 Chess cards in your cemetery, choose up to 2 instead. (1) Each
// opponent buries a follower. (2) Give your leader {[defense]}+3. (3) Draw 2 cards. (The number of
// options is decided when it is played, CR 5.18.3.1. (1): the opponent chooses — not a "select", so
// Aura doesn't protect, and burying isn't destroying — ruling.)
import { defineCard, spell } from "../helpers";
import { hasTrait } from "../targets";
import { inCemetery } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, p) => (inCemetery(g, p, hasTrait("チェス")) >= 5 ? 2 : 1),
      modes: [
        {
          id: "bury",
          label: "(1) Each opponent buries a follower",
          *resolve(fx) {
            const opponent = fx.game.opponent(fx.controller);
            const followers = fx.game.followers(opponent);
            if (followers.length > 0) yield* fx.bury(yield* fx.chooseCards(followers, 1, 1, opponent));
          },
        },
        {
          id: "defense",
          label: "(2) Give your leader +3 defense",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 3);
          },
        },
        {
          id: "draw",
          label: "(3) Draw 2 cards",
          *resolve(fx) {
            yield* fx.draw(2);
          },
        },
      ],
    }),
  ],
});
