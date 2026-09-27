// CSD03a-016 Stardust Trumpeter — Swordcraft amulet, 2. ヴァンガード・ロイヤルパラディン.
// Starting Amulet. (CR 14.4.4: the deck check and the facedown start on the field are the engine's.)
// Activate {[engage]}, bury this card: Select a Vanguard follower on your field and give it {[attack]}+1/{[defense]}+1.
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";
import { vanguard } from "../CP03/shared";

export default defineCard({
  keywords: ["startingAmulet"],
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: vanguard })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
    ),
  ],
});
