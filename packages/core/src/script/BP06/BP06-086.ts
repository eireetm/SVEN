// BP06-086 Antelope Pelt Warrior — Abysscraft follower, 2, 3/3. 獣.
// At the start of your main phase, deal 1 damage to your leader.
import { atStartOfYourMainPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourMainPhase({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
  ],
});
