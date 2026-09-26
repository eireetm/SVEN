// BP17-102 Balance and Obliteration — Havencraft spell, 6. 機械・信仰.
// Search your deck for a follower with "Marlone" in its name and a follower that costs 2 or less, summon them, then
// shuffle. Give your leader {[defense]}+2. (Either may be left out — ruling. Original cost, 元のコスト.)
import { defineCard, spell } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { marloneFollower } from "./shared-haven";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.searchEach([(id) => marloneFollower(g, id), (id) => isFollower(g, id) && costAtMost(2)(g, id)], { to: "field" });
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
