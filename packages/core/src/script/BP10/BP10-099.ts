// BP10-099 Topaz Swordian — Havencraft follower, 3, 2/3. 信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} Search your deck for a Bejeweled Shrine, summon it, then shuffle.
// {[fanfare]} {[cost02]} Give this follower {[attack]}+1/{[defense]}+3.
import { playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named("Bejeweled Shrine")(fx.game, id), { to: "field" });
      },
    }),
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 3);
      },
    }),
  ],
});
