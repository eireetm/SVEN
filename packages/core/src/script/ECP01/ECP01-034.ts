// ECP01-034 El Condor Pasa — Dragoncraft follower, 7, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Storm.
// {[fanfare]} Search your deck for a Champion's Passion, summon it, then shuffle.
import { defineCard, fanfare, serveAbility } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named("Champion's Passion")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
