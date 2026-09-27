// CP03-037 Flogal — Swordcraft follower, 2, 2/3. ヴァンガード・ロイヤルパラディン. Stand Trigger.
// At the start of your end phase, refresh this card.
// ----------
// (If this card is revealed by a drive check, refresh a follower on your field. For the rest of this turn, it can't attack
// enemy leaders.) (Resolved by the engine.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
