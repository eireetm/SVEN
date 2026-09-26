// BP17-060 Djeana, the Stouthearted (Evolved) — Dragoncraft follower, 3/3. 自然・獣.
// On Evolve - Discard 2 Natura cards: Increase your max play points by 1. (CR 10.4.7.4.)
// On Super-Evolve - Look at the top 4 cards of your deck. From among them, you may reveal up to 2 Natura cards and add them to
// your hand. Put the rest on the bottom of your deck in any order.
import { discardMatching } from "../costs";
import { defineCard, lookAtTopCards, onEvolve, onSuperEvolve } from "../helpers";
import { natura } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardMatching(natura, 2),
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: natura, to: "hand", max: 2 });
      },
    }),
  ],
});
