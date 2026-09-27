// Shared pieces of CSD03b card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { Keyword } from "../../model/keyword";

/**
 * CSD03b-001 / 002 Dragonic Overlord: "While Overflow is active for you, and there's another Kagero follower on your field, this
 * follower has Storm." A passive that comes and goes; an attack already declared goes on without it (rulings). Part of computing
 * keywords, so it reads types and traits with `typeAndTraits`.
 */
export const overlordStorm = (g: GameReader, self: CardId): readonly Keyword[] => {
  if (g.card(self)?.zone !== "field") return [];
  const p = g.controller(self);
  if (!g.overflow(p)) return [];
  const kagero = g.cards(p, "field").some((id) => {
    if (id === self) return false;
    const { type, traits } = g.typeAndTraits(id);
    return type === "follower" && traits.includes("かげろう");
  });
  return kagero ? ["storm"] : [];
};
