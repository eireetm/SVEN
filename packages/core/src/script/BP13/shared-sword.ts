// BP13 Swordcraft abilities shared by several cards (not a card).
import type { AutomaticAbility, FieldPassives } from "../types";
import { whenFollowerEntersYourField } from "../helpers";
import { and, isClass, isFollower, nameIncludes } from "../targets";
import { officer, yourTurn } from "./shared";

/** A {[swordcraft]} follower with "Albert" in its name (BP13-026 / 027). */
export const albertFollower = and(isFollower, isClass("Swordcraft"), nameIncludes("Albert"));

/**
 * BP13-022 / 023 "Your token followers don't take ability damage": every damage but combat damage to
 * followers and attack damage to leaders is ability damage (ruling; CR 5.14.3).
 */
export const tokensTakeNoAbilityDamage: FieldPassives = {
  damageToFollower: (g, self, damage) => {
    const c = g.card(damage.target);
    return damage.kind === "ability" && c !== undefined && g.controller(damage.target) === g.controller(self) && g.db.get(c.def).token
      ? -damage.amount
      : 0;
  },
};

/**
 * BP13-022 / 023 "During your turn, whenever an Officer follower is put onto your field, give your leader
 * +1 defense."
 */
export const officerEnters: AutomaticAbility = whenFollowerEntersYourField(
  {
    triggerIf: yourTurn,
    *resolve(fx) {
      yield* fx.giveLeaderDefense(fx.controller, 1);
    },
  },
  { filter: officer },
);
