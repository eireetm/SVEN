// BP10-080 Demonium, Clash Devil — Abysscraft follower, 3, 2/3. 魔界・シンガー.
// Bane. Drain.
// {[fanfare]} If Sanguine is active for you, give this follower {[attack]}+1/{[defense]}+1, Rush, and
// Assail.
// Strike - Deal each enemy leader damage equal to this follower's attack. (Ability damage: Drain
// doesn't apply — ruling, CR 12.13.)
import { defineCard, fanfare, strike } from "../helpers";

export default defineCard({
  keywords: ["bane", "drain"],
  abilities: [
    fanfare({
      condition: (g, p) => g.sanguine(p),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "rush");
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
    strike({
      *resolve(fx) {
        // Its attack when this resolves; gone from the field, there is none.
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), fx.game.info(fx.self).attack ?? 0);
      },
    }),
  ],
});
