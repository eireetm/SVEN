// BP05-017 Mark of the Six — Forestcraft spell, 1. 絶傑・狩人.
// Quick.
// The next time your leader would take damage this turn, it doesn't take damage.
// (Damage of 0 or less is not taken, so it doesn't use this up; "-X defense" or "change defense
// to 10" is not damage — rulings.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.preventNextDamage(fx.game.leader(fx.controller), "endOfTurn");
      },
    }),
  ],
});
