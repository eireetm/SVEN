// BP09-111 Suttungr (Evolved) — Neutral follower, 5/5. 巨人.
// Follower Strike - Give this follower {[attack]}+2/{[defense]}+2.
import { defineCard, followerStrike } from "../helpers";

export default defineCard({
  abilities: [
    followerStrike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
