// BP06-106 Focus — Havencraft spell, 0. 信仰.
// Quick.
// This card can't be played during your turn.
// If you have at least 2 play points, give your leader {[defense]}+1 and draw a card. (Playable
// with less, doing nothing — ruling.)
import { defineCard, spell } from "../helpers";
import { playPointsOf } from "./shared";

export default defineCard({
  keywords: ["quick"],
  playableIf: (g, _self, player) => g.activePlayer !== player,
  abilities: [
    spell({
      *resolve(fx) {
        if (playPointsOf(fx.game, fx.controller) < 2) return;
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
