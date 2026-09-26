// BP15-035 Chivalrous Bandit — Swordcraft follower, 2, 3/1. 兵士・盗賊.
// Rush.
// While there are at least 10 cards in opponents' cemeteries, this has Assail. (A passive; an attack already
// declared goes on without it — rulings.)
// {[fanfare]} Put a Gilded Blade token into your EX area. Each opponent buries the top card of their deck.
import { defineCard, fanfare } from "../helpers";
import { GILDED_BLADE, opponentsCemetery10 } from "./shared";

export default defineCard({
  keywords: ["rush"],
  selfKeywords: (g, self) => (opponentsCemetery10(g, g.controller(self)) ? ["assail"] : []),
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GILDED_BLADE]);
        yield* fx.mill(1, fx.game.opponent(fx.controller));
      },
    }),
  ],
});
