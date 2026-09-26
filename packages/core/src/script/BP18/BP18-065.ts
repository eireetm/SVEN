// BP18-065 After-School Break — Dragoncraft spell, 7. 透京・ドラゴニュート・武闘竜人.
// Search your deck for up to 3 Togh Keyoh followers with different names that cost 3 or less, summon them, then shuffle.
// Give your leader{[defense]}+2. (元のコスト; the leader gains even if none is found — ruling.)
import { defineCard, spell } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { toghKeyoh } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && toghKeyoh(g, id) && costAtMost(3)(g, id), { max: 3, distinctNames: true, to: "field" });
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
