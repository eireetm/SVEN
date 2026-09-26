// BP16-103 Reno, Luxwing Featherfolk — Havencraft follower, 2, 3/2. 先導・鳥族.
// Rush.
// Strike - Deal 1 damage to each enemy leader.
// {[fanfare]} If this was put onto the field by an ability, give it Assail and, for the rest of this turn, "This doesn't
// take damage." (Also during the opponent's turn; "-2/-2" isn't damage — rulings.)
import { defineCard, enteredByAbility, fanfare, strike } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
      },
    }),
    fanfare({
      *resolve(fx) {
        if (!enteredByAbility(fx) || fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveKeyword(fx.self, "assail");
        yield* fx.preventDamage(fx.self, "all", "endOfTurn");
      },
    }),
  ],
});
