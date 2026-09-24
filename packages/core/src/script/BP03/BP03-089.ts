// BP03-089 Infernal Orchestration — Abysscraft spell, 1. 魔界.
// Deal 1 damage to your leader. The next follower you play onto your field this turn gets +1/+1.
// Putting a follower by an ability does not count (ruling). Two copies both apply (ruling).
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        yield* fx.buffNextPlayedFollower();
      },
    }),
  ],
});
