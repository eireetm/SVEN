// Shared pieces of BP16 Runecraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { ActivatedAbility, AutomaticAbility } from "../types";
import { atStartOfYourEndPhase } from "../helpers";
import { isFollower } from "../targets";
import { festive } from "./shared";

/**
 * "the number of Academic cards in your cemetery" (BP16-037, 045). Read with `typeAndTraits` so it can be used
 * in `selfKeywords` (BP16-037 "While there are at least 10 Academic cards in your cemetery, this has Storm").
 */
export const academicInCemetery = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("学院")).length;

/** "the number of other Festive followers on your field" (BP16-040, 041). */
export const otherFestiveFollowers = (g: GameReader, p: PlayerId, self: CardId): number =>
  g.followers(p).filter((id) => id !== self && isFollower(g, id) && festive(g, id)).length;

/**
 * BP16-040 / 041 "At the start of your end phase, deal each enemy leader damage equal to the number of other
 * Festive followers on your field."
 */
export const zizdvendVerdict: AutomaticAbility = atStartOfYourEndPhase({
  *resolve(fx) {
    const x = otherFestiveFollowers(fx.game, fx.controller, fx.self);
    yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), x);
  },
});

/** BP16-038 / 039 "Activate - Earth Rite: Give this Assail." */
export const edacityAssail: Omit<ActivatedAbility, "kind" | "cost"> = {
  earthRite: { mode: "required" },
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "assail");
  },
};
