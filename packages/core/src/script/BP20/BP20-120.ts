// BP20-120 Greatness Ascended — Neutral spell, 3. 絶傑.
// When this is discarded, if there's a follower on your field with "Mjerrabaine" in its name, you may put it into your EX
// area. (From the hand, the hand limit too; the follower is checked as it resolves — rulings, CR 10.3.5.)
// --------
// This costs 2 less to play from the EX area.
// Draw 2 cards.
import { defineCard, spell, whenDiscarded } from "../helpers";
import { isFollower, nameIncludes } from "../targets";

export default defineCard({
  playCost: (g, self) => (g.playZone(self) === "ex" ? -2 : 0),
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone !== "cemetery") return;
        if (!g.cards(fx.controller, "field").some((id) => isFollower(g, id) && nameIncludes("Mjerrabaine")(g, id))) return;
        if (yield* fx.confirm()) yield* fx.putIntoEx([fx.self]);
      },
    }),
    spell({
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
