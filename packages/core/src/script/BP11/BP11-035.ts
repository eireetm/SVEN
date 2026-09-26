// BP11-035 Vincent, the Peacekeeper — Runecraft follower, 5, 4/4. 荒野・魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower. Activate only if this follower has gained attack or
// defense this turn. (Also after it took damage; super-evolving doesn't count, as the ability isn't
// playable before — rulings.)
// {[fanfare]} Search your deck for a Wasteland card, bury it, then shuffle.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { wasteland } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1, { condition: (g, _p, self) => g.gainedStatsThisTurn(self) }),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => wasteland(fx.game, id), { to: "cemetery" });
      },
    }),
  ],
});
