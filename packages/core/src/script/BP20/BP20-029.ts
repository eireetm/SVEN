// BP20-029 Supplicant of Usurpation — Swordcraft follower, 2, 2/3. 絶傑・盗賊.
// Once per turn, when you play or fuse a Loot card, give your leader {[defense]}+1. (On the opponent's turn too — ruling.)
// {[fanfare]} Put a Gilded Goblet token in your EX area.
import { defineCard, fanfare, whenYouPlayOrFuse } from "../helpers";
import { GILDED_GOBLET, LOOT } from "./shared";

export default defineCard({
  abilities: [
    {
      ...whenYouPlayOrFuse(
        {
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        },
        LOOT,
      ),
      oncePerTurn: true,
    },
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GILDED_GOBLET]);
      },
    }),
  ],
});
