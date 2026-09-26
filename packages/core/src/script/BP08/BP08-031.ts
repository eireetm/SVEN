// BP08-031 Wardog — Swordcraft follower, 2, 3/2. 兵士・獣.
// Fanfare: if a Commander card is on your field, deal 2 to each enemy leader. CR 5.14, 10.7.3.2.
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(p, "field").some((id) => hasTrait("指揮官")(g, id)),
      *resolve(fx) { yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2); },
    }),
  ],
});
