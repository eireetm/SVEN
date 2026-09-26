// BP12-091 Robowhip Reverend — Havencraft follower, 2, 2/2. 機械・信仰・狂信.
// {[fanfare]} Put a Repair Mode token into your EX area. f this card was put onto the field by an
// ability, give each Machina follower on your field {[attack]}+1/{[defense]}+1. ("f" is a typo for
// "If"; e.g. summoned by BP12-089's Fanfare — ruling.)
import { defineCard, enteredByAbility, fanfare } from "../helpers";
import { REPAIR, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
        if (!enteredByAbility(fx)) return;
        for (const id of fx.game.followers(fx.controller)) {
          if (machina(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
