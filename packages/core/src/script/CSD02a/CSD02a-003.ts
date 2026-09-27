// CSD02a-003 Miho Kohinata [P.C.S] — Swordcraft follower, 2, 2/2. デレマス・キュート.
// {[fanfare]} Look at the top card of your deck. If it's a Cute card, you may reveal it and add it to your hand. (Not taken, it
// stays on top unrevealed — ruling.)
// While there are at least 3 Cute followers on your field, this follower has Rush. (This one counts.)
import { defineCard, fanfare } from "../helpers";
import { cute } from "../CP02/shared";
import { mayTakeTopCard } from "../ECP02/shared";

export default defineCard({
  selfKeywords: (g, self) => {
    if (g.card(self)?.zone !== "field") return [];
    const cuteFollowers = g.cards(g.controller(self), "field").filter((id) => {
      const { type, traits } = g.typeAndTraits(id);
      return type === "follower" && traits.includes("キュート");
    });
    return cuteFollowers.length >= 3 ? ["rush"] : [];
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, cute);
      },
    }),
  ],
});
