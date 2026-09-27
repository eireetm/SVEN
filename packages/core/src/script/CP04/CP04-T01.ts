// CP04-T01 Ameth Amulet — Forestcraft equipment token, 2. プリコネ・美食殿.
// The equipped follower has "Activate {[engage]} this: Give each follower on your field {[attack]}+1/{[defense]}+1." (The follower's
// ability: not playable after it lost its abilities — ruling.)
// (Place this beneath the equipped follower.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  equipment: {
    abilities: [
      activated(
        { engageSelf: true },
        {
          *resolve(fx) {
            for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 1);
          },
        },
      ),
    ],
  },
});
