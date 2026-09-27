// CP03-068 Dragonic Executioner — Dragoncraft follower, 4, 5/5. ヴァンガード・かげろう.
// Rush.
// {[fanfare]} Discard a Kagero card: Draw 2 cards.
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { kagero } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      cost: discardA(kagero),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
