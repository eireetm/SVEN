// Shared pieces of BP16 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { hasTrait, isToken } from "../targets";

export { hasRoom, onYourField, yourTurn } from "../BP11/shared";
export { countIn, followerNamedOnField } from "../BP15/shared";

/** Traits used by several BP16 cards (日文种族). */
export const pixie = hasTrait("妖精");
export const puppetry = hasTrait("人形");
export const festive = hasTrait("宴楽");
export const crystalian = hasTrait("クリスタリア");
export const beast = hasTrait("獣");
export const officer = hasTrait("兵士");
export const levin = hasTrait("レヴィオン");
export const academic = hasTrait("学院");
export const golem = hasTrait("ゴーレム");
export const marine = hasTrait("海洋");
export const wasteland = hasTrait("荒野");
export const mount = hasTrait("乗物");
export const departed = hasTrait("死者");
export const vampire = hasTrait("吸血鬼");
export const faith = hasTrait("信仰");
export const luminary = hasTrait("先導");
export const supreme = hasTrait("超克");

export const FAIRY = "Fairy";
export const PUPPET = "Puppet";
export const LLOYD = "Lloyd";
export const STEELCLAD = "Steelclad Knight";
export const SHIELD_GUARDIAN = "Shield Guardian";
export const KNIGHT = "Knight";
export const GLITTERING_GOLD = "Glittering Gold";
export const MAGIC_SEDIMENT = "Magic Sediment";
export const GUARDIAN_GOLEM = "Guardian Golem";
export const DRAGON = "Dragon";
export const GHOST = "Ghost";
export const FOREST_BAT = "Forest Bat";
export const HOLY_TIGER = "Holy Tiger";

/**
 * "at least 3 Officer token followers on your field with different names" (BP16-025, 028, 029, 033, 034,
 * BP17-023): the number of different names among them (Steelclad Knight, Shield Guardian and Knight
 * are three — rulings).
 */
export const officerTokenNames = (g: GameReader, p: PlayerId): number =>
  new Set(g.followers(p).filter((id) => isToken(g, id) && officer(g, id)).map((id) => g.info(id).name)).size;

/** A Pixie token follower (BP16-002). */
export const pixieTokenFollower = (g: GameReader, id: CardId): boolean => g.info(id).type === "follower" && isToken(g, id) && pixie(g, id);
