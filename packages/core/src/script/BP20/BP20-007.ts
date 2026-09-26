// BP20-007 Congregrant of Unkilling — Forestcraft follower, 4, 3/3. 絶傑・狩人.
// Ward.
// {[fanfare]} Search your deck for up 1 follower with Omen and Hunter traits that costs 3 or less, summon it, then shuffle.
// (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { omenHunter } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && omenHunter(g, id) && costAtMost(3)(g, id), { to: "field" });
      },
    }),
  ],
});
