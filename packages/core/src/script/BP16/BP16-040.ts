// BP16-040 Zizdvend, Fate's Arbiter — Runecraft follower, 3, 3/3. 宴楽・禁忌.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Draw X cards. X equals the number of other Festive followers on your field.
// At the start of your end phase, deal each enemy leader damage equal to the number of other Festive followers on
// your field.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { otherFestiveFollowers, zizdvendVerdict } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(otherFestiveFollowers(fx.game, fx.controller, fx.self));
      },
    }),
    zizdvendVerdict,
  ],
});
