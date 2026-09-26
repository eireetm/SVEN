// BP08-089 Eidolon of Madness — Havencraft follower, 2, 0/3. 狂信・偶像.
// Evolve (2). Fanfare: with at least 3 amulets on your field, set this card's Evolve cost to 0 for
// this turn. Evolution is not a card entering the field (ruling; CR 5.16, 10.9.2).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      condition: (g, p) => g.cards(p, "field").filter((id) => isAmulet(g, id)).length >= 3,
      *resolve(fx) { yield* fx.setEvolveCost(fx.self, 0, "endOfTurn"); },
    }),
  ],
});
