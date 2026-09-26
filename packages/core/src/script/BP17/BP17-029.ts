// BP17-029 Bladerights Lieutenant — Swordcraft follower, 2, 1/1. 指揮官.
// {[fanfare]} Summon a Shield Gaurdian and Knight token. Put a Steelclad Knight token into your EX area. (With room for
// one, the player picks — ruling. "Gaurdian" is a typo in the English text.)
import { defineCard, fanfare } from "../helpers";
import { KNIGHT, SHIELD_GUARDIAN, STEELCLAD } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([SHIELD_GUARDIAN, KNIGHT]);
        yield* fx.tokensToEx([STEELCLAD]);
      },
    }),
  ],
});
