// DSD01b-006 Poseidon — Dragoncraft follower, 8, 4/7. 海洋・武闘竜人.
// Ward.
// {[fanfare]} Search your deck for up to 2 Draconic Duelist followers with different names that cost 2 or less, summon them, then
// shuffle your deck. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { draconicDuelist } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const filter = and(isFollower, draconicDuelist, costAtMost(2));
        yield* fx.search((id) => filter(fx.game, id), { to: "field", max: 2, distinctNames: true });
      },
    }),
  ],
});
