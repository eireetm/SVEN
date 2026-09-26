// BP10-097 Tanzanite Convictor — Havencraft follower, 3, 2/4. 信仰.
// Storm.
// {[fanfare]} If there's a follower with at least 7 defense on your field, deal 4 damage to each enemy
// follower on the field.
// At the start of your end phase, if this follower has at least 3 attack, refresh it.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      condition: (g, p) => g.followers(p).some((id) => (g.info(id).defense ?? 0) >= 7),
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 4);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, _p, self) => g.card(self)?.zone === "field" && (g.info(self).attack ?? 0) >= 3,
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
