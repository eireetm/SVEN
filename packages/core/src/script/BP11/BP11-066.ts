// BP11-066 Pumpkin Dragon — Dragoncraft follower, 8, 6/6. 竜族.
// Ward.
// {[fanfare]} Give your leader {[defense]}+5. Draw 2 cards.
// {[act]} {[cost02]}, discard this card and a {[dragoncraft]} card that costs 7 or more: Give your
// leader {[defense]}+5. (Valid in the hand — ruling, CR 10.3.5.)
import { activated, defineCard, fanfare } from "../helpers";
import { discardThisAndBigDragon } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
        yield* fx.draw(2);
      },
    }),
    activated(
      { playPoints: 2, custom: discardThisAndBigDragon },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 5);
        },
      },
    ),
  ],
});
