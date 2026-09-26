// Shared pieces of BP13 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { AutomaticAbility, FieldPassives } from "../types";
import { lastWords } from "../helpers";
import { and, hasTrait, isFollower, isToken } from "../targets";
import { hasRoom } from "../BP11/shared";

export { hasRoom, onYourField, yourTurn } from "../BP11/shared";

type Filter = (g: GameReader, id: CardId) => boolean;

/** Traits used by several BP13 cards (日文种族). */
export const pixie = hasTrait("妖精");
export const beast = hasTrait("獣");
export const levin = hasTrait("レヴィオン");
export const academic = hasTrait("学院");
export const mage = hasTrait("魔法使い");
export const draconicDuelist = hasTrait("武闘竜人");
export const commander = hasTrait("指揮官");
export const officer = hasTrait("兵士");
/** A Pixie token follower (BP13-003, 009, 010). */
export const pixieTokenFollower = and(isFollower, isToken, pixie);

export const FAIRY = "Fairy";

/** The number of [matching] cards in one of the player's zones. */
export const countIn = (g: GameReader, p: PlayerId, zone: "field" | "ex" | "cemetery" | "banished", filter: Filter): number =>
  g.cards(p, zone).filter((id) => filter(g, id)).length;

/**
 * BP13-003 / 004 "Each Pixie token follower on your field has Rush." Part of computing keywords, so it
 * reads types and traits with `typeAndTraits` (not `info`, which would recurse).
 */
export const pixieTokensHaveRush: NonNullable<FieldPassives["keywordsFor"]> = (g, self, card) => {
  const c = g.card(card);
  if (!c || c.zone !== "field" || g.controller(card) !== g.controller(self) || !g.db.get(c.def).token) return [];
  const { type, traits } = g.typeAndTraits(card);
  return type === "follower" && traits.includes("妖精") ? ["rush"] : [];
};

/**
 * "{[lastwords]} You may put this card into its owner's EX area." (BP13-003 / 004). A full EX area
 * can't take it (CR 4.8.3.2), so nothing is asked then.
 */
export const mayGoToExLastWords: AutomaticAbility = lastWords({
  *resolve(fx) {
    const c = fx.game.card(fx.self);
    if (c?.zone !== "cemetery" || !hasRoom(fx.game, c.owner, "ex")) return;
    if (yield* fx.confirm()) yield* fx.putIntoEx([fx.self]);
  },
});
