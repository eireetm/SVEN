// CP03-038 Yggdrasil Maiden, Elaine — Swordcraft follower, 2, 2/3. ヴァンガード・ロイヤルパラディン. Heal Trigger.
// Ward.
// {[fanfare]} Give your leader {[defense]}+2.
// ----------
// (If this card is revealed by a drive check, give your leader {[defense]}+3.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
