// BP13-050 Art Society Magus — Runecraft follower, 5, 4/5. 魔法使い.
// {[fanfare]} Put the top card of your deck into your EX area. Give your leader {[defense]}+X, where X equals
// the card's cost. (元のコスト of the card put there.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const [card] = yield* fx.topToEx(1);
        const x = card === undefined ? 0 : (fx.game.info(card).cost ?? 0);
        if (x > 0) yield* fx.giveLeaderDefense(fx.controller, x);
      },
    }),
  ],
});
