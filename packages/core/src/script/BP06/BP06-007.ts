// BP06-007 Fairy Dragon — Forestcraft follower, 2, 0/4. 妖精・精霊.
// Ward.
// {[fanfare]} Give this follower {[attack]}+1 for every Pixie token on your field and in your EX
// area.
// {[lastwords]} Put a Fairy Wisp and Fairy token into your EX area. (With room for one, you pick —
// ruling.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { and, hasTrait, isToken } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const pixieTokens = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.controller, "ex")].filter((id) =>
          and(isToken, hasTrait("妖精"))(fx.game, id),
        );
        yield* fx.giveStats(fx.self, pixieTokens.length, 0);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp", "Fairy"]);
      },
    }),
  ],
});
