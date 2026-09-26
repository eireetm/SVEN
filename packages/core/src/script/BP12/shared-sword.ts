// BP12 Swordcraft abilities shared by a card and its evolved card (not a card).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { Keyword } from "../../model/keyword";
import type { FieldPassives } from "../types";
import { AZORD, LECIA } from "./shared";

/**
 * BP12-025 / 026 "While there's a Lecia, Sky Saber on your field, this follower has Assail." Part of
 * computing this card's keywords, so it reads names with `namesOf` (not `info`).
 */
export const nanoAssail = (g: GameReader, self: CardId): readonly Keyword[] =>
  g.cards(g.controller(self), "field").some((id) => g.namesOf(id).includes(LECIA)) ? ["assail"] : [];

/** An Azord, Duke of the Mists on the field of this card's controller. */
const azordOfYours = (g: GameReader, self: CardId, card: CardId): boolean =>
  g.card(card)?.zone === "field" && g.controller(card) === g.controller(self) && g.namesOf(card).includes(AZORD);

/**
 * BP12-029 / 030 "Each Azord, Duke of the Mists on your field has Storm and 'Strike - Give this follower
 * +2/+2.'" (the Strike is the Azord's own ability, CR 10.9.1.2).
 */
export const liljeGivesAzord: FieldPassives = {
  keywordsFor: (g, self, card) => (azordOfYours(g, self, card) ? ["storm"] : []),
  grantsFor: (g, self, card) => (azordOfYours(g, self, card) ? ["strikePlus2"] : []),
};
