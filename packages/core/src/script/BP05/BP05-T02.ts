// BP05-T02 Destruction in Black — Runecraft amulet token, 2. 絶傑・アイドル.
// At the start of your main phase, deal 2 damage to each enemy leader.
import { atStartOfYourMainPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourMainPhase({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
