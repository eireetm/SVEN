// BP12-041 Sorcery in Solidarity — Runecraft spell, 3. 機械・魔法使い・ゴーレム.
// If there are at least 5 Machina cards in your cemetery, search your deck for a Machina follower that
// costs 3 or less and a 1-cost {[runecraft]} spell, summon the follower, put the spell into your EX area,
// then shuffle. (Playable without them; either may be left unfound — rulings.)
import { defineCard, spell } from "../helpers";
import { and, costAtLeast, costAtMost, isClass, isFollower, isSpell } from "../targets";
import { countIn, machina } from "./shared";

const cheapMachina = and(isFollower, machina, costAtMost(3));
const oneCostRunecraftSpell = and(isSpell, isClass("Runecraft"), costAtMost(1), costAtLeast(1));

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "cemetery", machina) < 5) return;
        yield* fx.searchEach(
          [(id) => cheapMachina(fx.game, id), (id) => oneCostRunecraftSpell(fx.game, id)],
          { to: ["field", "ex"] },
        );
      },
    }),
  ],
});
