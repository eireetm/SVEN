// BP15-T02 Gilded Goblet — Swordcraft spell token, 2. 財宝.
// Give your leader {[defense]}+1. If there are at least 10 cards in opponents' cemeteries, give {[defense]}+2
// instead.
import { defineCard, spell } from "../helpers";
import { opponentsCemetery10 } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, opponentsCemetery10(fx.game, fx.controller) ? 2 : 1);
      },
    }),
  ],
});
