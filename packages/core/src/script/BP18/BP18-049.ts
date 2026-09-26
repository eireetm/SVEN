// BP18-049 Mari, Card Conjurer — Runecraft follower, 3, 1/1. 魔法使い.
// {[fanfare]}/{[lastwords]} Draw a card. Bury the top card of your deck.
import { defineCard, fanfare, lastWords, type TimingSpec } from "../helpers";

const drawAndBury: TimingSpec = {
  *resolve(fx) {
    yield* fx.draw(1);
    yield* fx.mill(1);
  },
};

export default defineCard({
  abilities: [fanfare(drawAndBury), lastWords(drawAndBury)],
});
