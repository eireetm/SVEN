// ECP01-016 Tap Dance City — Swordcraft follower, 3, 2/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Search your deck for a 1-cost Umamusume follower, summon it, then shuffle. (元のコスト.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { umamusumeFollower } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => umamusumeFollower(g, id) && g.info(id).cost === 1, { to: "field" });
      },
    }),
  ],
});
