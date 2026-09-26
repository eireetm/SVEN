// Shared pieces of BP14 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { costAtMost, hasTrait, isClass, named } from "../targets";

export { hasRoom, onYourField, yourTurn } from "../BP11/shared";

type Filter = (g: GameReader, id: CardId) => boolean;

/** Traits used by several BP14 cards (日文种族). */
export const festive = hasTrait("宴楽");
export const hunter = hasTrait("狩人");
export const mage = hasTrait("魔法使い");
export const zealot = hasTrait("狂信");
export const beast = hasTrait("獣");
export const marine = hasTrait("海洋");
export const commander = hasTrait("指揮官");
export const goblin = hasTrait("ゴブリン");

export const PUPPET = "Puppet";
export const FAIRY = "Fairy";
export const GLITTERING_GOLD = "Glittering Gold";
export const FOX = "Fox of Invitation";
export const DRAGONSPRING = "Soothing Dragonspring";
export const DIVINE_WATER = "divineWater";
export const HOZUMI = "Hozumi, Enchanting Hostess";
export const JIEMON = "Jiemon, Thief Lord";
export const YUKISHIMA = "Yukishima, Master Biographer";

/** The number of [matching] cards in one of the player's zones. */
export const countIn = (g: GameReader, p: PlayerId, zone: "field" | "ex" | "cemetery" | "hand", filter: Filter): number =>
  g.cards(p, zone).filter((id) => filter(g, id)).length;

/** "if there's a [name] on your field" (a card on your field with that name). */
export const namedOnYourField = (g: GameReader, p: PlayerId, name: string): boolean => g.cards(p, "field").some((id) => named(name)(g, id));

/**
 * BP14-018 / 025 / 070 "if there are at least 5 Festive cards or at least 10 [class] cards in your
 * cemetery".
 */
export const paradiseReady = (cls: string) => (g: GameReader, p: PlayerId): boolean =>
  countIn(g, p, "cemetery", festive) >= 5 || countIn(g, p, "cemetery", isClass(cls)) >= 10;

/** Soothing Dragonsprings on the player's field with at least `n` divine water counters. */
const dragonspringsWith = (g: GameReader, p: PlayerId, n: number): CardId[] =>
  g.cards(p, "field").filter((id) => named(DRAGONSPRING)(g, id) && g.counters(id, DIVINE_WATER) >= n);

/**
 * "Remove 2 divine water counters from a Soothing Dragonspring on your field" (BP14-055, 061, 063, 066;
 * a field of the cost's controller, CR 10.4.3). Without such counters it can't be paid (rulings).
 */
export const removeDivineWater: CustomCost = {
  canPay: (g, c) => dragonspringsWith(g, c, 2).length > 0,
  *pay(fx) {
    const [spring] = yield* fx.chooseCards(dragonspringsWith(fx.game, fx.controller, 2), 1, 1);
    if (spring !== undefined) yield* fx.removeCounters(spring, DIVINE_WATER, 2);
  },
};

/** "Put a card from your hand on the bottom of your deck" (BP14-008, a cost). */
export const handCardToDeckBottom: CustomCost = {
  canPay: (g, c) => g.cards(c, "hand").length > 0,
  *pay(fx) {
    yield* fx.putOnDeck(yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1), "bottom");
  },
};

/**
 * BP14-036 / 049 "a Festive card that costs 3 or less or Mage card that costs 3 or less" (元のコスト; a card
 * that is both counts once — ruling).
 */
export const festiveOrMage3: Filter = (g, id) => (festive(g, id) || mage(g, id)) && costAtMost(3)(g, id);

/** "Festive cards and/or Mage cards" (BP14-044: each card once — rulings). */
export const festiveOrMageDef = (g: GameReader, def: string): boolean => {
  const traits = g.db.get(def).traits;
  return traits.includes("宴楽") || traits.includes("魔法使い");
};
