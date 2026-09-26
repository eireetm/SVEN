// BP08-032 Mana Pistol Merc — Swordcraft follower, 5, 5/4. 傭兵・超克.
// Evolve (2), or Evolve (0) if a Commander card is on your field. CR 10.3.2, 12.2.
import { defineCard, evolveAbility } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    evolveAbility(0, { condition: (g, p) => g.cards(p, "field").some((id) => hasTrait("指揮官")(g, id)) }),
  ],
});
