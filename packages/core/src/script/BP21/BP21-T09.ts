// BP21-T09 Cyclical Guidance — Havencraft spell token, 2. 先導・学院.
// Select up to X enemy followers on the field. Deal them each 5 damage and give each Academic follower on your field
// {[attack]}+1/{[defense]}+1. X equals the number of time your leader has gained defense this turn. (X is known when it is
// played, CR 5.2.1.1; playable with none selected — ruling.)
import { defineCard, spell } from "../helpers";
import { ANY, enemyFollower } from "../targets";
import { academicFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: ANY, upTo: true, max: (g, c) => g.leaderDefenseGainedThisTurn(c) })],
      *resolve(fx) {
        const chosen = fx.targets[0] ?? [];
        if (chosen.length > 0) yield* fx.dealDamageEach(chosen, 5);
        for (const id of fx.game.followers(fx.controller).filter((f) => academicFollower(fx.game, f))) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
