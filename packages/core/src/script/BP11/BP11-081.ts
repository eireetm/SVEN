// BP11-081 Redcap (Evolved) — Abysscraft follower, 6/5. 魔界.
// Follower Strike - For the rest of this turn, this follower doesn't take damage.
// At the start of your end phase, refresh this card.
import { atStartOfYourEndPhase, defineCard, followerStrike } from "../helpers";

export default defineCard({
  abilities: [
    followerStrike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.preventDamage(fx.self, "all", "endOfTurn");
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
