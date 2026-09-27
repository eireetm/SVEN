// CP03-036 Margal — Swordcraft follower, 1, 2/2. ヴァンガード・ロイヤルパラディン. Draw Trigger.
// {[fanfare]} Discard a Royal Paladin card: Draw a card.
// ----------
// (If this card is revealed by a drive check, draw a card.) (Resolved by the engine.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { royalPaladin } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(royalPaladin),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
