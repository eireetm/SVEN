// CP02-097 Natalia — Havencraft follower, 2, 1/3. デレマス・パッション.
// Storm.
// {[fanfare]} Select an enemy follower on the field and deal it damage equal to the number of other Passion followers on your
// field.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { passion } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const others = fx.game.followers(fx.controller).filter((id) => id !== fx.self && passion(fx.game, id)).length;
        if (others > 0) yield* fx.dealDamage(fx.targets[0]![0]!, others);
      },
    }),
  ],
});
