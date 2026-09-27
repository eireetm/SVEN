// CP04-079 Grace — Abysscraft follower, 1, 2/1. プリコネ・〈ジオ・ニヴルヘル〉.
// {[ub]}{[fanfare]} Draw a card. Discard a card. Bury the top 2 cards of your deck.
// While there's another Geo Niflhel follower on your field, this has Ward. (A passive — ruling.)
import { defineCard, fanfare, ub } from "../helpers";
import { anotherOnYourField, traitOf } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
          yield* fx.mill(2);
        },
      }),
    ),
  ],
  field: {
    keywordsFor: (g, self, card) => (card === self && anotherOnYourField(g, self, traitOf("〈ジオ・ニヴルヘル〉")) ? ["ward"] : []),
  },
});
