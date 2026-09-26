// Shared pieces of BP17 card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { hasTrait, named } from "../targets";
import { countIn } from "../BP15/shared";

export { hasRoom, onYourField, yourTurn } from "../BP11/shared";
export { countIn, followerNamedOnField } from "../BP15/shared";
export { officerTokenNames } from "../BP16/shared";
export { treeOntoFieldOrEx } from "../BP07/shared";

/** Traits used by several BP17 cards (日文种族). */
export const natura = hasTrait("自然");
export const beast = hasTrait("獣");
export const puppetry = hasTrait("人形");
export const officer = hasTrait("兵士");
export const assassin = hasTrait("暗殺者");
export const machina = hasTrait("機械");
export const academic = hasTrait("学院");
export const marine = hasTrait("海洋");
export const faith = hasTrait("信仰");
export const angel = hasTrait("天使");

export const TREE = "Naterran Great Tree";
export const PUPPET = "Puppet";
export const STEELCLAD = "Steelclad Knight";
export const SHIELD_GUARDIAN = "Shield Guardian";
export const KNIGHT = "Knight";
export const REPAIR = "Repair Mode";
export const DROID = "Assembly Droid";
export const FOREST_BAT = "Forest Bat";

/** A card named Naterran Great Tree (the BP07-T03 token). */
export const isTree = named(TREE);

/** "the number of Machina cards in your EX area" (BP17-043, 044, 047, 099, 106, 119). */
export const machinaInEx = (g: GameReader, p: PlayerId): number => countIn(g, p, "ex", machina);
