// BP12-107 Travelers' Respite — Neutral spell, 1. 荒野・自然.
// Look at the top 3 cards of your deck. You may reveal a Wasteland card or Natura card from among them
// and add it to your hand. Put the rest on the bottom of your deck in any order. If there's a Wasteland
// card on your field or in your EX area, give your leader {[defense]}+1.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { natura, onFieldAndEx, wasteland } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => wasteland(g, id) || natura(g, id), to: "hand" });
        if (onFieldAndEx(fx.game, fx.controller, wasteland) > 0) yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
