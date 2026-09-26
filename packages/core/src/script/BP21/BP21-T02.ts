// BP21-T02 Verdant Prayer — Forestcraft spell token, 5. エルフ族・学院・超克.
// Look at the top 7 cards of your deck. You may summon up to 3 Academic and/or Beast followers that cost a total of 5 or less
// from among them. Put the rest on the bottom of your deck in any order. Give each follower on your field
// {[attack]}+1/{[defense]}+1. (元のコスト.)
import { defineCard, selectWithinTotalCost, spell } from "../helpers";
import { academicOrBeastFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(7);
        const chosen = yield* selectWithinTotalCost(fx, top.filter((id) => academicOrBeastFollower(fx.game, id)), 5, 3, top);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
        for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
