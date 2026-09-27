// CP03-080 Irontail Dragon — Dragoncraft follower, 1, 1/2. ヴァンガード・かげろう.
// Activate {[engage]}: Give this follower {[attack]}+1.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 1, 0);
        },
      },
    ),
  ],
});
