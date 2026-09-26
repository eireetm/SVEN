// BP12-114 Wayfaring Illustrator — Neutral follower, 3, 2/3. 傭兵.
// {[fanfare]} Select an enemy follower on the field. Search your deck for an X-cost follower, put it into
// your EX area, then shuffle. X equals the selected follower's cost. (元のコスト: an evolved follower has
// its base card's — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target) === undefined) return;
        const x = fx.game.info(target).cost;
        yield* fx.search((id) => isFollower(fx.game, id) && fx.game.info(id).cost === x, { to: "ex" });
      },
    }),
  ],
});
