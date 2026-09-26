// BP14-026 Masterful Musician — Swordcraft follower, 3, 3/3. 宴楽・盗賊.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Glittering Gold token into your EX area. If there's a Jiemon, Thief Lord on your field,
// give your leader {[defense]}+3. (Also with a full EX area — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { GLITTERING_GOLD, JIEMON, namedOnYourField } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
        if (namedOnYourField(fx.game, fx.controller, JIEMON)) yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
