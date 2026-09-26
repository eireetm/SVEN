// BP13-T01 Anne's Summoning — Runecraft follower token, 2, 4/4. ゴーレム・魔法生物・学院.
// Rush. Ward.
// {[fanfare]} Give your leader {[defense]}+2.
// At the start of your main phase, banish this card.
import { atStartOfYourMainPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush", "ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    atStartOfYourMainPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.banish([fx.self]);
      },
    }),
  ],
});
