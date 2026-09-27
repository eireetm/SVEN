// CP03-027 Knight of Loyalty, Bedivere — Swordcraft follower, 2, 3/2. ヴァンガード・ロイヤルパラディン.
// Ward.
// {[fanfare]} If there is a follower with "Blaster" in its name on your field, give this follower {[attack]}+1 and Storm.
import { defineCard, fanfare } from "../helpers";
import { nameIncludes } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      condition: (g, c) => g.followers(c).some((id) => nameIncludes("Blaster")(g, id)),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
