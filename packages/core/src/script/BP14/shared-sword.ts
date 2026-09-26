// Shared pieces of BP14 Swordcraft card scripts (not a card: the file name has no set prefix).
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { FieldPassives } from "../types";
import { banishFromYourEx } from "../costs";
import { lookAtTopCards } from "../helpers";
import { and, costAtMost, named } from "../targets";
import { festive, GLITTERING_GOLD } from "./shared";

/**
 * BP14-022 / 023 "Each other Festive follower on your field has Storm." Part of computing keywords, so it
 * reads types and traits with `typeAndTraits` (not `info`, which would recurse).
 */
export const otherFestiveHaveStorm: NonNullable<FieldPassives["keywordsFor"]> = (g, self, card) => {
  if (card === self || g.card(card)?.zone !== "field" || g.controller(card) !== g.controller(self)) return [];
  const { type, traits } = g.typeAndTraits(card);
  return type === "follower" && traits.includes("宴楽") ? ["storm"] : [];
};

/** BP14-023 "Banish 2 cards named Glittering Gold from your EX area". */
export const banishTwoGold = banishFromYourEx(named(GLITTERING_GOLD), 2);

/**
 * BP14-023's On Evolve after its cost: "Look at the top 5 cards of your deck. You may put a Festive card that
 * costs 3 or less from among them into your EX area. It costs 3 less to play this turn. Put the rest on the
 * bottom of your deck in any order." (元のコスト.)
 */
export function* jiemonDig(fx: EffectContext): Proc<void> {
  for (const id of yield* lookAtTopCards(fx, 5, { filter: and(festive, costAtMost(3)), to: "ex" })) {
    yield* fx.changePlayCost(id, -3, "endOfTurn");
  }
}
