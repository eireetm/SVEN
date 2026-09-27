// CP03-057 Rainbow Magician — Runecraft follower, 2, 3/2. ヴァンガード・ペイルムーン. Draw Trigger.
// {[fanfare]} Select a Pale Moon card in your banished zone. Add it to your hand, then banish a card from your hand.
// ----------
// (If this card is revealed by a drive check, draw a card.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { paleMoon } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("banished", { filter: paleMoon })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        const hand = fx.game.cards(fx.controller, "hand");
        yield* fx.banish(yield* fx.chooseCards(hand, Math.min(1, hand.length), 1));
      },
    }),
  ],
});
