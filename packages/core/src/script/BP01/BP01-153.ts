// BP01-153 Lucifer (Evolved) — 8/7.
// Bane. // At the start of your end phase, deal 4 damage to each enemy leader.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 4);
      },
    }),
  ],
});
