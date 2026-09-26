// BP16-113 Ruler of Cocytus — Neutral follower, 6, 6/6. 魔王.
// {[fanfare]} Deal 6 damage to your leader. Put a Silent Rider, Servant of Cocytus, Demon of Purgatory, and Astaroth's
// Reckoning token into your EX area. (With less room the player picks which — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 6);
        yield* fx.tokensToEx(["Silent Rider", "Servant of Cocytus", "Demon of Purgatory", "Astaroth's Reckoning"]);
      },
    }),
  ],
});
