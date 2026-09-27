// Shared pieces of PCS01 card scripts (not a card: the file name has no set prefix).
import type { FieldPassives } from "../types";

/** "Each other PriConne follower on your field has Ward." (Computing keywords: types and traits with `typeAndTraits`.) */
export const priconneHaveWard: NonNullable<FieldPassives["keywordsFor"]> = (g, self, card) => {
  const c = g.card(card);
  if (card === self || !c || c.zone !== "field" || g.controller(card) !== g.controller(self)) return [];
  const { type, traits } = g.typeAndTraits(card);
  return type === "follower" && traits.includes("プリコネ") ? ["ward"] : [];
};
