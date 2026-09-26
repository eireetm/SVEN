// BP15-T03 Gilded Boots — Swordcraft spell token, 2. 財宝.
// Select a Thief follower on your field and give it Rush. If there are at least 10 cards in opponents'
// cemeteries, give Storm instead.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";
import { opponentsCemetery10, thief } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: thief })],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, opponentsCemetery10(fx.game, fx.controller) ? "storm" : "rush");
      },
    }),
  ],
});
