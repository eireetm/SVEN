// BP04-044 Chain of Calling — Runecraft spell, 2. 魔法使い. Quick.
// (BP04-045 is the same card.)
// Look at the top 5 cards of your deck. You may reveal a Runecraft follower from among them and
// add it to your hand. Put the remaining cards on the bottom of your deck in any order.
// Spellchain (10): Recover 1 play point. (This spell is in the resolution zone and does not count
// — ruling. Playable with fewer or no cards in the deck — ruling.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        const sc10 = fx.game.spellchain(fx.controller, 10); // fixed as it starts to resolve (CR 13.3.1.4)
        yield* lookAtTopCards(fx, 5, { filter: (g, id) => isFollower(g, id) && isClass("Runecraft")(g, id), to: "hand" });
        if (sc10) yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
