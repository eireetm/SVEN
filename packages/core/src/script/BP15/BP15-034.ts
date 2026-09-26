// BP15-034 Hermit of Usurpation — Swordcraft follower, 3, 3/3. 絶傑・盗賊.
// {[fanfare]} Put a Gilded Goblet and Gilded Boots token into your EX area. Each opponent buries the top card of
// their deck. (With room for one, the player chooses which — ruling, CR 4.8.3.2.)
// Once per turn, when you play a Loot card, give this {[attack]}+1/{[defense]}+1. (Also during the opponent's turn
// — ruling.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { GILDED_BOOTS, GILDED_GOBLET, loot } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GILDED_GOBLET, GILDED_BOOTS]);
        yield* fx.mill(1, fx.game.opponent(fx.controller));
      },
    }),
    whenYouPlay(
      {
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        },
      },
      loot,
    ),
  ],
});
