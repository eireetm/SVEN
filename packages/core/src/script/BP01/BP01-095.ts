// BP01-095 Ace Dragoon — Dragoncraft follower, 2, 0/2.
// Rush. // {[fanfare]} Select another follower on the field and give this follower +X attack.
// X equals the selected follower's attack. (Either side; its current attack, fixed once given —
// rulings.)
import { defineCard, fanfare } from "../helpers";
import { anotherFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [anotherFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.self, fx.game.info(fx.targets[0]![0]!).attack ?? 0, 0);
      },
    }),
  ],
});
