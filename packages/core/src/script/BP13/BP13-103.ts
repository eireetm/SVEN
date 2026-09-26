// BP13-103 Sacred Groundskeeper — Havencraft follower, 2, 0/5. 信仰・獣.
// Ward.
// {[fanfare]} If this follower wasn't put onto the field from hand, give it {[attack]}+2. (Played from hand
// or summoned from there, it was; from the EX area, deck, cemetery and so on, it wasn't — ruling, CR 5.5.3.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      condition: (g, _p, self) => g.enteredFrom(self) !== "hand",
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
