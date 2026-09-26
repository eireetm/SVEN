// BP15-090 Hermit of Lust — Abysscraft follower, 2, 1/3. 絶傑・魔界.
// {[fanfare]} Give your leader {[defense]}-1: Give this Intimidate. (CR 10.4.7.4, 10.4.5.)
// Activate Give your leader {[defense]}-1: Give this {[attack]}+1. Activate only once per turn.
import { leaderDefenseCost } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      cost: leaderDefenseCost(1),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "intimidate");
      },
    }),
    activated(
      { leaderDefense: 1 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
        },
      },
    ),
  ],
});
