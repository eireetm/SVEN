// CP03-042 Silver Thorn Dragon Tamer, Luquier — Runecraft follower, 7, 5/5. ヴァンガード・ペイルムーン.
// Rush. Twin Drive.
// {[fanfare]} Select up to 1 Pale Moon follower that costs 4 or less, up to 1 that costs 3 or less, and up to 1 that costs 2
// or less in your banished zone and summon them. (Three different cards; 元のコスト. The summoned followers' Fanfares may be
// ordered by the player — rulings.)
import type { TargetSpec } from "../types";
import { defineCard, fanfare } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { followerThat, paleMoon } from "./shared";

const paleMoonCosting = (n: number): TargetSpec =>
  inYourZone("banished", { upTo: true, distinct: true, filter: (g, id) => followerThat(paleMoon)(g, id) && costAtMost(n)(g, id) });

export default defineCard({
  keywords: ["rush", "twinDrive"],
  abilities: [
    fanfare({
      targets: [paleMoonCosting(4), paleMoonCosting(3), paleMoonCosting(2)],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets.flat());
      },
    }),
  ],
});
