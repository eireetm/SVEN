// BP09-075 Gift for Bloodkin — Abysscraft spell, 2. 吸血鬼・プリンセス.
// This card costs 2 less to play if there are at least 5 Vampire cards in your cemetery.
// ----------
// Summon 2 Forest Bat tokens. If there's a follower with "Vania" in its name in your cemetery, draw a
// card. (The draw happens even if no Bat fits on the field — ruling.)
import { defineCard, spell } from "../helpers";
import { and, isFollower, nameIncludes } from "../targets";
import { countIn, FOREST_BAT, vampire } from "./shared";

export default defineCard({
  playCost: (g, _self, controller) => (countIn(g, controller, "cemetery", vampire) >= 5 ? -2 : 0),
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon([FOREST_BAT, FOREST_BAT]);
        if (countIn(fx.game, fx.controller, "cemetery", and(isFollower, nameIncludes("Vania"))) > 0) yield* fx.draw(1);
      },
    }),
  ],
});
