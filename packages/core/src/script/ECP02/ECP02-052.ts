// ECP02-052 Asuka Ninomiya [Sweet & Charming] — Abysscraft follower, 2, 3/2. デレマス・クール.
// While there are at least 3 Cool followers on your field, this has Storm. (This follower counts; a passive ability — ruling.)
// {[fanfare]} {[cost02]}, Lesson (1): Search your deck for a follower with "Ranko Kanzaki" in its name, put it into your EX area,
// then shuffle. It costs 4 less to play this turn. (Lesson may banish a Magical Item from a full EX area and so make room —
// ruling.)
import { allCosts, lesson, playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { followerNamed, searchIntoExCheaper } from "./shared";

export default defineCard({
  field: {
    // typeAndTraits (not info) inside the keyword passive.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const cool = g.cards(g.controller(self), "field").filter((id) => {
        const t = g.typeAndTraits(id);
        return t.type === "follower" && t.traits.includes("クール");
      });
      return cool.length >= 3 ? ["storm"] : [];
    },
  },
  abilities: [
    fanfare({
      cost: allCosts(playPointsCost(2), lesson(1)),
      *resolve(fx) {
        yield* searchIntoExCheaper(fx, followerNamed("Ranko Kanzaki"), 4);
      },
    }),
  ],
});
