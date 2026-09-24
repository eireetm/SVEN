// BP02-026 Jeno, Levin Vanguard (Evolved) — 4/4.
// Assail.
// On Evolve: Look at the top 4 cards of your deck. From among them, you may reveal a Levin
// follower with a different name from this card and add it to your hand. Put the remaining cards
// on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const name = fx.game.db.get(fx.sourceDef).name;
        const levin = and(isFollower, hasTrait("レヴィオン"), (g, id) => g.info(id).name !== name);
        yield* lookAtTopCards(fx, 4, { filter: levin, to: "hand" });
      },
    }),
  ],
});
