// BP19-106 Avaricious Altruist — Havencraft follower, 3, 3/3. 信仰・獣.
// {[fanfare]} Search your deck for a Beast follower or a Beast amulet that costs 1 or less, summon it, then shuffle.
// ("1 or less" — the Japanese, Chinese and official English texts; 元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { costAtMost, isAmulet, isFollower } from "../targets";
import { beast } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => beast(g, id) && (isFollower(g, id) || isAmulet(g, id)) && costAtMost(1)(g, id), { to: "field" });
      },
    }),
  ],
});
