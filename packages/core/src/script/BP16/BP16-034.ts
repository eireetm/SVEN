// BP16-034 Lyrala, Luminous Potionwright — Swordcraft follower, 1, 1/1. 兵士・ルミナス.
// Ward.
// {[fanfare]} Put a Steelclad Knight and Shield Guardian token into your EX area. (With room for one, the player
// picks — ruling.)
// {[act]} {[cost00]}: Give your leader {[defense]}+2. Activate only if there are at least 3 Officer token followers
// on your field with different names, and only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { SHIELD_GUARDIAN, STEELCLAD } from "./shared";
import { threeOfficerNames } from "./shared-sword";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([STEELCLAD, SHIELD_GUARDIAN]);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: threeOfficerNames,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
