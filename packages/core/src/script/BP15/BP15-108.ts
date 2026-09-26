// BP15-108 Hermit of Repose — Havencraft follower, 3, 1/5. 絶傑・狂信.
// {[fanfare]} {[cost02]} Give this {[attack]}+2.
// At the start of each opponent's main phase, deal each enemy follower on the field damage equal to this follower's
// attack.
import { playPointsCost } from "../costs";
import { atStartOfOpponentsMainPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
    atStartOfOpponentsMainPhase({
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone !== "field") return;
        yield* fx.dealDamageEach(g.followers(g.opponent(fx.controller)), g.info(fx.self).attack ?? 0);
      },
    }),
  ],
});
