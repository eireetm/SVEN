// BP14-022 Jiemon, Thief Lord — Swordcraft follower, 4, 3/4. 宴楽・指揮官・盗賊.
// {[evolve]} {[cost01]}: Evolve this.
// Each other Festive follower on your field has Storm.
// {[fanfare]} Put a Glittering Gold token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { GLITTERING_GOLD } from "./shared";
import { otherFestiveHaveStorm } from "./shared-sword";

export default defineCard({
  field: { keywordsFor: otherFestiveHaveStorm },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
  ],
});
