// BP19-071 Dark Mermaid — Dragoncraft follower, 6, 6/6. 海洋.
// {[fanfare]} Select an enemy follower on the field and destroy it. Put the top card of your deck into your EX area. (Without
// a target nothing happens — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.topToEx(1);
      },
    }),
  ],
});
