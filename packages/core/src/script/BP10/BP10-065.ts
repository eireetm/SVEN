// BP10-065 Swiftblade Dragonewt (Evolved) — Dragoncraft follower, 4/4. ドラゴニュート・竜族・武装.
// On Evolve - Search your deck for an Armed follower that costs 2 or less, summon it, then shuffle.
// Summon a Draconic Weapon token. (Also when none is found — ruling. 元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { armed } from "./shared";

const cheapArmedFollower = and(isFollower, armed, costAtMost(2));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => cheapArmedFollower(fx.game, id), { to: "field" });
        yield* fx.summon(["Draconic Weapon"]);
      },
    }),
  ],
});
