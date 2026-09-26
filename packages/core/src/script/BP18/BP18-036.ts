// BP18-036 Princess Teena — Swordcraft follower, 3, 3/4. プリンセス.
// {[fanfare]} Search your deck for a 1-cost follower, put it into your EX area, then shuffle. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && fx.game.info(id).cost === 1, { to: "ex" });
      },
    }),
  ],
});
