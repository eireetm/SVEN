// BP11-089 Vengeful Sniper — Havencraft follower, 3, 3/3. 荒野・信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} If there are at least 2 amulets on your field and/or in your EX area, deal 2 damage to
// each enemy leader. (Both zones together — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => [...g.cards(p, "field"), ...g.cards(p, "ex")].filter((id) => isAmulet(g, id)).length >= 2,
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
