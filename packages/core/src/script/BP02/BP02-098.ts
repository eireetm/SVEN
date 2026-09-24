// BP02-098 Sapphire Priestess — Havencraft follower, 4, 4/5.
// At the start of your end phase, if your followers attacked at least 3 times this turn, draw 3
// cards. (An attack counts even if the attacker left the field during it — ruling; CR 8.4.5.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      condition: (g, c) => g.followerAttacksThisTurn(c) >= 3,
      *resolve(fx) {
        yield* fx.draw(3);
      },
    }),
  ],
});
