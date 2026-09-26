// Shared pieces of BP19 Swordcraft card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { FieldPassives } from "../types";
import { isClass, isFollower } from "../targets";
import { loot } from "./shared";

/**
 * BP19-019 / 020 "Loot cards in your EX area cost 1 less to play." — during your turn (the Japanese, Chinese and official
 * English texts; effect_en leaves it out). Two of them: 2 less (rulings).
 */
export const lootDiscount: FieldPassives["playCostOf"] = (g, self, card, player) =>
  player === g.controller(self) && g.activePlayer === player && g.playZone(card) === "ex" && loot(g, card) ? -1 : 0;

/** "the number of {[swordcraft]} followers on your field and/or in your EX area" (BP19-021). */
export const swordFollowersAround = (g: GameReader, p: PlayerId): number =>
  [...g.cards(p, "field"), ...g.cards(p, "ex")].filter((id) => isFollower(g, id) && isClass("Swordcraft")(g, id)).length;
