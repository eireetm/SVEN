// BP14-067 Loyal Sea Serpent — Dragoncraft follower, 2, 2/3. 竜使い・海洋.
// Ward.
// {[fanfare]} {[cost04]} Summon a Dragon token.
// Whenever a {[dragoncraft]} token follower is put onto your field, give your leader {[defense]}+2. (Also
// during the opponent's turn — ruling.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { and, isClass, isToken } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(4),
      *resolve(fx) {
        yield* fx.summon(["Dragon"]);
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
      { filter: and(isToken, isClass("Dragoncraft")) },
    ),
  ],
});
