// BP05-002 Izudia, Omen of Unkilling (Evolved) — Forestcraft follower, 5/5. 絶傑・狩人.
// Activate {[engage]}: Deal 6 damage to each enemy leader with at least 10 defense.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          const leader = fx.game.leader(fx.game.opponent(fx.controller));
          if ((fx.game.info(leader).defense ?? 0) >= 10) yield* fx.dealDamage(leader, 6);
        },
      },
    ),
  ],
});
