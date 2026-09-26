// BP14-030 Front Desk Frog — Swordcraft follower, 2, 2/2. 宴楽・盗賊・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Glittering Gold token into your EX area. If there's a Jiemon, Thief Lord on your field,
// evolve this. (Not this turn's evolve ability; also with a full EX area — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { GLITTERING_GOLD, JIEMON, namedOnYourField } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
        if (namedOnYourField(fx.game, fx.controller, JIEMON) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
