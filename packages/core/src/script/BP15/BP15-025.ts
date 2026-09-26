// BP15-025 Arsène Lupin (Evolved) — Swordcraft follower, 3/2. 兵士・盗賊.
// On Evolve - Look at the top 4 cards of your deck. You may reveal a Thief card from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { thief } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: thief, to: "hand" });
      },
    }),
  ],
});
