// BP06-049 Charming Gentlemouse — Runecraft follower, 2, 2/2. 魔法生物.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} {[cost02]} Search your deck for a Charming Gentlemouse, summon it, then shuffle your
// deck. (Its Fanfare triggers too — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { playPointsCost } from "../costs";
import { named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => named("Charming Gentlemouse")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
