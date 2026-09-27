// CP03-079 Dragon Monk, Genjo — Dragoncraft follower, 1, 1/1. ヴァンガード・かげろう. Heal Trigger.
// Ward.
// {[fanfare]} Give your leader {[defense]}+1. If Overflow is active for you, give {[defense]}+2 instead.
// ----------
// (If this card is revealed by a drive check, give your leader {[defense]}+3.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, fx.game.overflow(fx.controller) ? 2 : 1);
      },
    }),
  ],
});
