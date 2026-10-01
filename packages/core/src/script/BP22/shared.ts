// Shared pieces of BP22 card scripts (not a card: the file name has no set prefix).
//
// BP22 is a pre-release set (data/preview.ts): its cards are implemented from the Japanese text (the Chinese text checked
// against it), and a card of this set is named by its Japanese name until the English data is out. Every script names
// BP22 cards through the constants below, so that renaming them then is one edit here.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { hasTrait, isFollower, isToken } from "../targets";

// BP22 card names (Japanese until the English data is out).
export const BRILLIANT_FAIRY = "ブリリアントフェアリー"; // BP22-001
export const ERIN = "永久なる輝き・エリン"; // BP22-003 / 004
export const VICTORY_BLADER = "ビクトリーブレイダー"; // BP22-019
export const ICEBLOCK_GOLEM = "氷塊のゴーレム"; // BP22-052
export const IGNIS_DRAGON = "イグニスドラゴン"; // BP22-056 / 057
export const PIERCING_ROAR = "貫く咆哮"; // BP22-067
export const DRAGOSNAKE = "堅殻のドラゴスネーク"; // BP22-070
export const KERNUNNOS = "ケルヌンノス"; // BP22-077
export const ZOMBIE_DOG = "ゾンビドッグ"; // BP22-080
export const HUGINN_AND_MUNINN = "フギン＆ムニン"; // BP22-085
export const GOD_OF_CURSES = "ゴッド・オブ・カース"; // BP22-092
export const SAINTS_COMMAND = "聖女の号令"; // BP22-T01 (spell token)
export const SHADOW_GENERAL = "シャドウジェネラル"; // BP22-T02
export const RADIANT_ARTIFACT = "レディアントアーティファクト"; // BP22-T03

// Tokens and cards of earlier sets (their English names).
export const FAIRY = "Fairy"; // BP01-T03 フェアリー
export const FAIRY_WISP = "Fairy Wisp"; // BP01-T02 フェアリーウィスプ
export const GLITTERING_GOLD = "Glittering Gold"; // BP14-T02 輝く金貨
export const STEELCLAD_KNIGHT = "Steelclad Knight"; // BP01-T07 スティールナイト
export const SHIELD_GUARDIAN = "Shield Guardian"; // BP02-T02 シールドガーディアン
export const KNIGHT = "Knight"; // BP01-T05 ナイト
export const VIKING = "Viking"; // BP01-T06 ヴァイキング
export const STRIKEFORM_GOLEM = "Strikeform Golem"; // BP01-T08 攻撃型ゴーレム
export const GUARDFORM_GOLEM = "Guardform Golem"; // BP01-T09 防御型ゴーレム
export const ANCIENT_ARTIFACT = "Ancient Artifact"; // BP05-T04 エンシェントアーティファクト
export const KEENEDGE_ARTIFACT = "Keenedge Artifact"; // BP13-T05 エッジアーティファクト
export const HOLY_FALCON = "Holy Falcon"; // BP01-T16 ホーリーファルコン
export const LUMIORE = "Lumiore, Prestigious Gold"; // BP21-058 金色の威信・リュミオール

// Traits (日文种族).
export const pixie = hasTrait("妖精");
export const elf = hasTrait("エルフ族");
export const crystalia = hasTrait("クリスタリア");
export const verdant = hasTrait("植物族");
export const commander = hasTrait("指揮官");
export const officer = hasTrait("兵士");
export const thief = hasTrait("盗賊");
export const golem = hasTrait("ゴーレム");
export const dragonewt = hasTrait("ドラゴニュート");
export const marine = hasTrait("海洋");
export const departed = hasTrait("死者");
export const goblin = hasTrait("ゴブリン");
export const vampire = hasTrait("吸血鬼");
export const avian = hasTrait("鳥族");
export const beast = hasTrait("獣");
export const umamusume = hasTrait("ウマ娘");

/** "A Pixie token follower" (妖精・トークン・フォロワー: all three, BP22-001, 006). */
export const pixieTokenFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && isToken(g, id) && pixie(g, id);

/** "The number of Pixie cards in your EX area" (BP22-007, 008, 011). */
export const pixiesInEx = (g: GameReader, p: PlayerId): number => g.cards(p, "ex").filter((id) => pixie(g, id)).length;

/** "The number of Dragonewt cards in your EX area" (BP22-058, 063). */
export const dragonewtsInEx = (g: GameReader, p: PlayerId): number => g.cards(p, "ex").filter((id) => dragonewt(g, id)).length;

/** 元のコスト — a card's cost information (CR 2.5; play cost changes don't change it, 10.4.4.1). */
export const costOf = (g: GameReader, id: CardId): number | null => g.info(id).cost;

/** "The number of cards with original cost 2 in your cemetery" (BP22-074, 077, 078). */
export const cost2InCemetery = (g: GameReader, p: PlayerId): number => g.cards(p, "cemetery").filter((id) => costOf(g, id) === 2).length;

/** "The number of different original costs among the cards in your cemetery" (元のコストの種類数, BP22-048, 050). */
export const distinctCostsInCemetery = (g: GameReader, p: PlayerId): number =>
  new Set(g.cards(p, "cemetery").flatMap((id) => {
    const cost = costOf(g, id);
    return cost === null ? [] : [cost];
  })).size;

/** "Your field has a [card named X]" (BP22-005, 006, 023, 067 ...). */
export const onYourField = (g: GameReader, p: PlayerId, match: (g: GameReader, id: CardId) => boolean): boolean =>
  g.cards(p, "field").some((id) => match(g, id));
