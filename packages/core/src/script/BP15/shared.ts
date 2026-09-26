// Shared pieces of BP15 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { and, hasTrait, isFollower, isSpell, nameIncludes } from "../targets";

export { hasRoom, onYourField, yourTurn } from "../BP11/shared";

type Filter = (g: GameReader, id: CardId) => boolean;

/** Traits used by several BP15 cards (日文种族). */
export const omen = hasTrait("絶傑");
export const hunter = hasTrait("狩人");
export const pixie = hasTrait("妖精");
export const mage = hasTrait("魔法使い");
export const thief = hasTrait("盗賊");
export const loot = hasTrait("財宝");
export const officer = hasTrait("兵士");
export const commander = hasTrait("指揮官");
export const idolatry = hasTrait("アイドル");
export const onmyoji = hasTrait("陰陽師");
export const marine = hasTrait("海洋");
export const yokai = hasTrait("妖怪");
export const demon = hasTrait("魔界");
export const angel = hasTrait("天使");
export const fallenAngel = hasTrait("堕天使");

export const PUPPET = "Puppet";
export const FAIRY_WISP = "Fairy Wisp";
export const GILDED_BLADE = "Gilded Blade";
export const GILDED_GOBLET = "Gilded Goblet";
export const GILDED_BOOTS = "Gilded Boots";
export const PAPER_SHIKIGAMI = "Paper Shikigami";

/** The number of [matching] cards in one of the player's zones. */
export const countIn = (g: GameReader, p: PlayerId, zone: "field" | "ex" | "cemetery" | "hand", filter: Filter): number =>
  g.cards(p, zone).filter((id) => filter(g, id)).length;

/** "a follower on your field with [name] in its name" (CR 2.1.2). */
export const followerNamedOnField = (g: GameReader, p: PlayerId, part: string): boolean =>
  g.followers(p).some((id) => nameIncludes(part)(g, id));

/** "at least 10 cards in opponents' cemeteries" (BP15-020, 024, 026, 028, 034, 035, T01–T03, PR10). */
export const opponentsCemetery10 = (g: GameReader, p: PlayerId): boolean => g.cards(g.opponent(p), "cemetery").length >= 10;

/** "a follower with both the Omen and Mage traits" (BP15-050, 053, PR11). */
export const omenMageFollower: Filter = and(isFollower, omen, mage);

/**
 * "at least 7 spells and/or Onmyoji cards in your cemetery" (BP15-041, 046): a card that is both counts
 * once (rulings).
 */
export const spellsOrOnmyojiInCemetery = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => isSpell(g, id) || onmyoji(g, id)).length;

/** "a follower with "Lishenna" in its name" (BP15-045). */
export const lishennaFollower: Filter = and(isFollower, nameIncludes("Lishenna"));
