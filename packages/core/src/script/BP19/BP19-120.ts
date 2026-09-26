// BP19-120 Blackrust Underling — Neutral follower, 3, 3/3. 八獄・超克.
// Storm.
// Strike - Select an enemy follower on the field and, if there's a follower with "Cutthroat" in its name on your field or
// in your cemetery, deal it 4 damage.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { cutthroatAround } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (cutthroatAround(fx.game, fx.controller)) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
