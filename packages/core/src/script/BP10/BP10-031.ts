// BP10-031 Honorable Thief — Swordcraft follower, 2, 2/2. 盗賊.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Each opponent buries the top 2 cards of their deck. Then, if there are at least 10 cards
// in opponents' cemeteries, evolve this follower. (Not an evolve ability: it doesn't count for the
// once-per-turn limit, CR 8.3.2.1 — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.mill(2, opponent);
        if (fx.game.cards(opponent, "cemetery").length >= 10 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
