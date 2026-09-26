// BP20-030 Lair of Usurpation — Swordcraft amulet, 8. 絶傑・盗賊.
// Activate Remove a fusion counter from this, engage this, bury this: Search your deck for up to 3 followers with Omen and
// Thief traits each with different names and total cost 8 or less, summon them, then shuffle. (元のコスト; with room for
// fewer, the player picks which — ruling.)
// Activate, Fuse 3 Loot cards that cost at least 1: Put a fusion counter on this. (Valid in the hand — ruling.)
import { removeCountersFromThis } from "../costs";
import { activated, defineCard } from "../helpers";
import { isFollower } from "../targets";
import { omenThief } from "./shared";
import { fuseLootForCounters } from "./shared-sword";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: removeCountersFromThis("fusion"), burySelf: true },
      {
        *resolve(fx) {
          const g = fx.game;
          yield* fx.search((id) => isFollower(g, id) && omenThief(g, id), { max: 3, distinctNames: true, totalCostAtMost: 8, to: "field" });
        },
      },
    ),
    fuseLootForCounters(3, () => 1),
  ],
});
