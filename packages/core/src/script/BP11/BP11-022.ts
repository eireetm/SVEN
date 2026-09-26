// BP11-022 Reinhardt, the Deathless (Evolved) — Swordcraft follower, 4/5. 指揮官.
// Assail.
// At the start of your end phase, give this follower and your leader {[defense]}+2.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 0, 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
