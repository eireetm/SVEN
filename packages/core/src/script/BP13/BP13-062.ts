// BP13-062 Flame Pillar Dragonewt (Evolved) — Dragoncraft follower, 4/4. ドラゴニュート・武闘竜人.
// On Evolve - Search your deck for a Draconic Duelist follower that costs 3 or less, summon it, then
// shuffle. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { draconicDuelist } from "./shared";

const cheapDuelist = and(isFollower, draconicDuelist, costAtMost(3));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => cheapDuelist(fx.game, id), { to: "field" });
      },
    }),
  ],
});
