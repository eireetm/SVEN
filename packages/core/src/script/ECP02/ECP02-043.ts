// ECP02-043 Yui Ohtsuki [Lollipop Darling] (Evolved) — 2/2.
// On Evolve - Choose 1. (1) Look at the top 2 cards of your deck. You may reveal a Passion card from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order. (2) {[cost03]}, bury this: Search your deck for a follower with "Yui
// Ohtsuki" in its name, summon it, then shuffle. Evolve it. ("bury this" is in the Japanese and official English texts, not in this
// printing's English. Evolved by this effect: no Evolve cost, and it may be declined; another Lollipop Darling evolved this way can
// do it again — rulings.)
import { allCosts, buryThis, playPointsCost } from "../costs";
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { followerNamed, passion } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "look",
          label: "Look at the top 2 cards and take a Passion card",
          *resolve(fx) {
            yield* lookAtTopCards(fx, 2, { filter: passion, to: "hand" });
          },
        },
        {
          id: "search",
          label: 'Pay 3 and bury this: summon a follower with "Yui Ohtsuki" in its name from your deck and evolve it',
          cost: allCosts(playPointsCost(3), buryThis),
          *resolve(fx) {
            const found = yield* fx.search((id) => followerNamed("Yui Ohtsuki")(fx.game, id), { to: "field" });
            for (const id of found) if (fx.game.card(id)?.zone === "field") yield* fx.evolve(id);
          },
        },
      ],
    }),
  ],
});
