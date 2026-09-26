// Shared pieces of BP19 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { hasTrait, isFollower, nameIncludes } from "../targets";

/** Traits used by several BP19 cards (日文种族). */
export const condemned = hasTrait("八獄");
export const puppetry = hasTrait("人形");
export const thief = hasTrait("盗賊");
export const loot = hasTrait("財宝");
export const officer = hasTrait("兵士");
export const maid = hasTrait("メイド");
export const ninja = hasTrait("忍者");
export const mage = hasTrait("魔法使い");
export const machina = hasTrait("機械");
export const dragonewt = hasTrait("ドラゴニュート");
export const draconicDuelist = hasTrait("武闘竜人");
export const marine = hasTrait("海洋");
export const faith = hasTrait("信仰");
export const beast = hasTrait("獣");

export const PUPPET = "Puppet";
export const MEGALORCA = "Megalorca";
export const HOLY_TIGER = "Holy Tiger";
export const PIRATE_FLAG = "Dread Pirate's Flag";
export const MULTI_HEADED = "Multi-Headed Test Subject";
export const VOLUNTEER = "Volunteer Test Subject";
export const ERRALDE = "Erralde, Troth Convict";
export const GARODETH = "Garodeth, Insurgent Convict";
export const MYROEL = "Myroel, Death Enforcer";

/** "a Condemned follower" (BP19-002, 005, 007, 011, 074, 080, 092). */
export const condemnedFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && condemned(g, id);

/** "the number of Condemned followers in your cemetery" (BP19-039, 048, T02). */
export const condemnedInCemetery = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => condemnedFollower(g, id)).length;

/** "a follower with 'Cutthroat' in its name on your field or in your cemetery" (BP19-115, 118, 120). */
export const cutthroatAround = (g: GameReader, p: PlayerId): boolean =>
  [...g.cards(p, "field"), ...g.cards(p, "cemetery")].some((id) => isFollower(g, id) && nameIncludes("Cutthroat")(g, id));
