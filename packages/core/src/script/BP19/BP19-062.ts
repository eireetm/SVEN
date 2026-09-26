// BP19-062 Neptune, Arbiter of Tides — Dragoncraft follower, 3, 3/4. 竜使い・海洋.
// Whenever a Megalorca is put onto your field, give it Storm. Give your leader {[defense]}+1. (During the opponent's turn
// too; two of these trigger twice — rulings.)
// {[fanfare]} Put a Megalorca token into your EX area. If Overflow is active for you, summon a Megalorca token.
// {[act]} {[cost00]}: The next Marine card you play from your EX area this turn costs 1 less to play. Activate only once per
// turn.
import { activated, defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { named } from "../targets";
import { marine, MEGALORCA } from "./shared";

export default defineCard({
  nextPlay: { marineFromEx: (g, card) => marine(g, card) && g.playZone(card) === "ex" },
  abilities: [
    whenCardEntersYourField(
      {
        *resolve(fx) {
          const orca = fx.data?.card;
          if (orca !== undefined && fx.game.card(orca)?.zone === "field") yield* fx.giveKeyword(orca, "storm");
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { filter: named(MEGALORCA) },
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([MEGALORCA]);
        if (fx.game.overflow(fx.controller)) yield* fx.summon([MEGALORCA]);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.nextPlayCostsLess("marineFromEx", 1);
        },
      },
    ),
  ],
});
