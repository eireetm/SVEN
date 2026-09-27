// CP04-042 Maho (Evolved) — Runecraft, 3/3. プリコネ・カォン.
// On Evolve - Look at the top 4 cards of your deck. You may put one of them into your EX area. Put the rest on the bottom of your
// deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: () => true, to: "ex" });
      },
    }),
  ],
});
