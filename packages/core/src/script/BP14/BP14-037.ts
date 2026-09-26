// BP14-037 Riley, Astral Shaman — Runecraft follower, 2, 2/2. 魔法使い.
// {[evolve]} {[cost02]}: Evolve this. Activate only if you've used Earth Rite to remove at least 2 Stack
// counters from cards on your field with Stack this turn. (Two Earth Rites of 1 or one of 2 — rulings.)
// {[fanfare]} Summon a Magic Sediment token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2, { condition: (g, p) => g.stackRemovedByEarthRiteThisTurn(p) >= 2 }),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
  ],
});
