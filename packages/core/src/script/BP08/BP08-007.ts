// BP08-007 Lina & Lena, Twin Souls — Forestcraft follower, 4, 3/3. 狩人・獣.
// Storm.
// Strike - If there are at least 3 followers on your field, give this follower {[attack]}+1.
// (Strike resolves in the confirmation timing before the opponent's quick timing, so a follower
// removed there doesn't matter — ruling, CR 8.4.6, 8.4.7.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      condition: (g, p) => g.followers(p).length >= 3,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
      },
    }),
  ],
});
