// BP21-T07 Lilium's Dragon — Dragoncraft follower token, 2, 5/5. 竜族・学院.
// Rush. Assail.
// Follower Strike - Change the enemy follower's attack and defense to 1. (CR 12.7.2.1.)
import { changeStatsTo, defineCard, followerStrike } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    followerStrike({
      *resolve(fx) {
        if (fx.event?.type !== "attackDeclared") return;
        yield* changeStatsTo(fx, fx.event.target, { attack: 1, defense: 1 });
      },
    }),
  ],
});
