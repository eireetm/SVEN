// BP14-024 Bumpkin Recruit — Swordcraft follower, 1, 1/1. 兵士.
// {[fanfare]} If there are at least 5 {[swordcraft]} followers in your cemetery, give this {[attack]}+1 and
// Rush.
// {[lastwords]} Draw a card.
import { defineCard, fanfare, lastWords } from "../helpers";
import { and, isClass, isFollower } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => countIn(g, p, "cemetery", and(isFollower, isClass("Swordcraft"))) >= 5,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
