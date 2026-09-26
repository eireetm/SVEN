// BP21-116 Goblin's Gratitude — Neutral spell, 3. 学院・ゴブリン.
// Look at the top 4 cards of your deck. You may reveal up to 2 Academic cards from among them and add them to your hand. Put
// the rest on the bottom of your deck in any order. Recover 1 play point.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { academic } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: academic, to: "hand", max: 2 });
        yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
