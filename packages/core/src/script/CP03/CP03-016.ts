// CP03-016 Pyroxene Communications Sea Otter Soldier — Forestcraft follower, 2, 1/3. ヴァンガード・アクアフォース. Draw Trigger.
// {[fanfare]} Draw a card.
// ----------
// (If this card is revealed by a drive check, draw a card.) (Resolved by the engine, CR 14.4.5.1.3.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
