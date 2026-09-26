// BP19-097 Warden of the Wings (Evolved) — 3/3.
// On Evolve - Look at the top 4 cards of your deck. You may reveal an amulet or an Uneriel, Winged Enforcer from among them
// and add it to your hand. Put the rest on the bottom of your deck in any order.
// {[lastwords]} You may summon a 1-cost or less amulet from your hand.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { isAmulet, named } from "../targets";
import { wingsLastWords } from "./shared-haven";

const uneriel = named("Uneriel, Winged Enforcer");

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => isAmulet(g, id) || uneriel(g, id), to: "hand" });
      },
    }),
    wingsLastWords,
  ],
});
