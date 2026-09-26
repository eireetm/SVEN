// BP15-061 Celestial Dragoon (Evolved) — Dragoncraft follower, 2/2. 竜使い.
// On Evolve - Look at the top 5 cards of your deck. You may reveal a {[dragoncraft]} card that costs 7 or more
// from among them and add it to your hand. Put the rest on the bottom of your deck in any order. (元のコスト.)
// Whenever you discard a card, engage this: Draw a card.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtLeast, isClass } from "../targets";
import { celestialDragoonDraw } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(isClass("Dragoncraft"), costAtLeast(7)), to: "hand" });
      },
    }),
    celestialDragoonDraw(),
  ],
});
