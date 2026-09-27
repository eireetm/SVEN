// CP03-031 Miru Biru — Swordcraft follower, 1, 1/1. ヴァンガード・ロイヤルパラディン.
// {[fanfare]} Reveal a Royal Paladin card in your hand: Draw a card.
import { revealFromHand } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { royalPaladin } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: revealFromHand(royalPaladin, 1),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
