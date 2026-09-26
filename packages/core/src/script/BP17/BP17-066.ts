// BP17-066 Newfound Allies — Dragoncraft spell, 8. 機械・自然・ドラゴニュート.
// Shuffle your deck, then look at the top 2 cards. You may summon up to 2 followers from among them. Bury the rest.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.shuffleDeck();
        yield* lookAtTopCards(fx, 2, { filter: isFollower, to: "field", max: 2, rest: "cemetery" });
      },
    }),
  ],
});
