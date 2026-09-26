// BP11-073 Hazhan, Demonblade Knight (Evolved) — Abysscraft follower, 1/6. 魔界.
// Assail. Bane. Drain.
// Strike - Deal 2 damage to each enemy leader. Refresh this follower. Perform only once per turn.
// (CR 10.7.2.2; not again after it attacks a second time — ruling.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["assail", "bane", "drain"],
  abilities: [
    strike({
      oncePerTurn: true,
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
