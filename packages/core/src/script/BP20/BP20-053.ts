// BP20-053 Devotee of Truth — Runecraft follower, 2, 2/3. 絶傑・魔法使い.
// {[fanfare]} Draw a card, then discard a card. If this wasn't put onto the field from hand, give your leader {[defense]}+2.
// (From the EX area too — ruling.)
import { defineCard, fanfare } from "../helpers";
import { notFromHand } from "./shared-rune";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
        if (fx.game.card(fx.self)?.zone === "field" && notFromHand(fx.game, fx.self)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
