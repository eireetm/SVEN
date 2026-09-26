// Shared pieces of BP20 card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { and, hasTrait, isClass } from "../targets";

/** Traits used by several BP20 cards (日文种族). */
export const omen = hasTrait("絶傑");
export const hunter = hasTrait("狩人");
export const heir = hasTrait("継承者");
export const verdant = hasTrait("植物族");
export const fae = hasTrait("精霊");
export const pixie = hasTrait("妖精");
export const beast = hasTrait("獣");
export const thief = hasTrait("盗賊");
/** 財宝 — "Loot". */
export const LOOT = "財宝";
export const loot = hasTrait(LOOT);
export const omenHunter = and(omen, hunter);
export const officer = hasTrait("兵士");
export const idolatry = hasTrait("アイドル");
export const mage = hasTrait("魔法使い");
export const onmyoji = hasTrait("陰陽師");
export const omenMage = and(omen, mage);
export const omenIdolatry = and(omen, idolatry);
export const wyrmkin = hasTrait("竜族");
export const marine = hasTrait("海洋");
export const omenWyrmkin = and(omen, wyrmkin);
export const yokai = hasTrait("妖怪");
export const zealot = hasTrait("狂信");
export const omenZealot = and(omen, zealot);
/** "an {[abysscraft]} Omen card" (BP20-075, 077, 080, 086). */
export const abyssOmen = and(isClass("Abysscraft"), omen);
export const omenThief = and(omen, thief);

export const ANNIHILATING_ONSLAUGHT = "Annihilating Onslaught";
export const GILDED_BLADE = "Gilded Blade";
export const GILDED_GOBLET = "Gilded Goblet";
export const GILDED_BOOTS = "Gilded Boots";
export const WHITE_PSALM = "White Psalm, New Revelation";
export const BLACK_PSALM = "Black Psalm, New Revelation";
export const MELODIOUS_MONODY = "Melodious Monody";
export const ERSATZ_ELIMINATION = "Ersatz Elimination";
export const MEGALORCA = "Megalorca";
export const RULENYE = "Rulenye, Echoing Scream";

/** "the number of Hunter cards in your cemetery" (BP20-001, 002, 008, 012, T12). */
export const huntersInCemetery = (g: GameReader, p: PlayerId): number => g.cards(p, "cemetery").filter((id) => hunter(g, id)).length;

/** "an enemy follower on the field with 1 defense" (BP20-009, 010). */
export const enemyFollowerWithOneDefense = (g: GameReader, p: PlayerId): boolean =>
  g.followers(g.opponent(p)).some((id) => g.statsOf(id).defense === 1);
