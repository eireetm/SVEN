// Shared pieces of BP18 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { CustomCost } from "../types";
import { hasTrait, isEvolvedFollower, named } from "../targets";

/** Traits used by several BP18 cards (日文种族). */
export const toghKeyoh = hasTrait("透京");
export const crystalian = hasTrait("クリスタリア");
export const beast = hasTrait("獣");
export const detective = hasTrait("探偵");
export const commander = hasTrait("指揮官");
export const mage = hasTrait("魔法使い");
export const academic = hasTrait("学院");
export const draconicDuelist = hasTrait("武闘竜人");
export const marine = hasTrait("海洋");
export const demon = hasTrait("魔界");
export const vampire = hasTrait("吸血鬼");
export const faith = hasTrait("信仰");
export const wardOffice = hasTrait("区役所");

export const FOREST_BAT = "Forest Bat";
export const GIGABYTE_BLADE = "Gigabyte Blade";
export const GIGABYTE = "gigabyte";
export const SEISHIRO = "Seishiro, Admonishing Faith";

/** "the number of faceup evolved Togh Keyoh followers in your evolve deck" (BP18-008, 013; CR 4.6.3). */
export const faceupToghKeyoh = (g: GameReader, p: PlayerId): number =>
  g.faceUpEvolveDeck(p).filter((id) => isEvolvedFollower(g, id) && toghKeyoh(g, id)).length;

/** "the number of Togh Keyoh cards on your field" (BP18-021, 028, 032). */
export const toghKeyohOnField = (g: GameReader, p: PlayerId): number => g.cards(p, "field").filter((id) => toghKeyoh(g, id)).length;

/** "the number of cards in your banished zone" (BP18-041–052). */
export const banishedCount = (g: GameReader, p: PlayerId): number => g.cards(p, "banished").length;

/** "the number of 2-cost cards in your cemetery" (元のコスト, BP18-079, 088). */
export const twoCostInCemetery = (g: GameReader, p: PlayerId): number => g.cards(p, "cemetery").filter((id) => g.info(id).cost === 2).length;

/** A card with original cost 2 (元のコスト2, BP18-079, 082, 086, 090). */
export const costsTwo = (g: GameReader, id: CardId): boolean => g.info(id).cost === 2;

/** "each Gigabyte Blade on your field" (BP18-027). */
export const bladesOnField = (g: GameReader, p: PlayerId): CardId[] => g.cards(p, "field").filter((id) => named(GIGABYTE_BLADE)(g, id));

/** "Place N gigabyte counters on each Gigabyte Blade on your field" (BP18-027, 029, 031, T02; CR 15.1). */
export function* chargeBlades(fx: EffectContext, n: number): Proc<void> {
  for (const blade of bladesOnField(fx.game, fx.controller)) yield* fx.addCounters(blade, GIGABYTE, n);
}

/** "Remove 10 gigabyte counters from a Gigabyte Blade on your field" as a cost (BP18-021, 022; ruling: not without them). */
export const drainBlade: CustomCost = {
  canPay: (g, c) => bladesOnField(g, c).some((id) => g.counters(id, GIGABYTE) >= 10),
  *pay(fx) {
    const blades = bladesOnField(fx.game, fx.controller).filter((id) => fx.game.counters(id, GIGABYTE) >= 10);
    for (const blade of yield* fx.chooseCards(blades, 1, 1)) yield* fx.removeCounters(blade, GIGABYTE, 10);
  },
};

/** "a Draconic Duelist follower with at least 4 attack" (BP18-060, 062, 063, 066, 067, 070). */
export const bigDuelist = (g: GameReader, id: CardId): boolean =>
  draconicDuelist(g, id) && g.info(id).type === "follower" && (g.info(id).attack ?? 0) >= 4;
