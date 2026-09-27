// CP03-059 Candy Clown — Runecraft follower, 2, 1/3. ヴァンガード・ペイルムーン. Heal Trigger.
// Ward.
// {[fanfare]} Give your leader {[defense]}+2. Banish the top card of your deck.
// ----------
// (If this card is revealed by a drive check, give your leader {[defense]}+3.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.banish(fx.topCards(1));
      },
    }),
  ],
});
