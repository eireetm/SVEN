// BP07-052 Valdain, Cursed Shadow — Dragoncraft follower, 4, 4/4. 自然・ドラゴニュート.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[evolve]} {[cost00]}: Evolve this follower. Acivate only if there are at least 10 Natura cards in
// your cemetery.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Natura card from among them and
// add it to your hand. Bury the rest.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { countIn, natura } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    evolveAbility(0, { condition: (g, c) => countIn(g, c, "cemetery", natura) >= 10 }),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: natura, to: "hand", rest: "cemetery" });
      },
    }),
  ],
});
