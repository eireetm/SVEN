// BP11-063 / 064 Mermaid Guide (not a card).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";

/**
 * "While there are at least 5 Marine cards in your cemetery, this follower has Storm." (A passive —
 * ruling.) It reads the traits with typeAndTraits: `info()` of a cemetery card would compute its
 * keywords, and this card itself may be one of them (recursion).
 */
export const stormWithFiveMarines = (g: GameReader, self: CardId) =>
  g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("海洋")).length >= 5 ? (["storm"] as const) : [];
