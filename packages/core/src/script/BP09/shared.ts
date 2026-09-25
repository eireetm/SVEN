// Abilities shared by several BP09 cards (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { FieldPassives } from "../types";
import { and, hasTrait, isClass, isFollower, isSpell, named } from "../targets";

export const FOREST_BAT = "Forest Bat";
export const ONION = "Onion Patch";

/** Forestcraft / Dragoncraft spells. */
export const forestSpell = and(isClass("Forestcraft"), isSpell);
export const dragonSpell = and(isClass("Dragoncraft"), isSpell);
/** Academic (学院), Vampire (吸血鬼), Angel (天使), Beast (獣), Wyrmkin (竜族), Draconic Duelist (武闘竜人) cards. */
export const academic = hasTrait("学院");
export const vampire = hasTrait("吸血鬼");
export const angel = hasTrait("天使");
export const beastFollower = and(isFollower, hasTrait("獣"));
export const wyrmkin = hasTrait("竜族");
export const draconicDuelist = hasTrait("武闘竜人");
export const forestBat = named(FOREST_BAT);

/** The number of [matching] cards in one of the player's zones. */
export const countIn = (g: GameReader, p: PlayerId, zone: "field" | "ex" | "cemetery" | "hand", filter: (g: GameReader, id: CardId) => boolean): number =>
  g.cards(p, zone).filter((id) => filter(g, id)).length;

/** "If there is a [name] on your field". */
export const onYourField = (g: GameReader, p: PlayerId, name: string): boolean => g.cards(p, "field").some((id) => named(name)(g, id));

/**
 * "The number of Forestcraft spells with different names in your cemetery" (カード名の種類数,
 * BP09-001 / 007 / 011 / 012). The spell being played is not in the cemetery yet (rulings).
 */
export const forestSpellNames = (g: GameReader, p: PlayerId): number =>
  new Set(g.cards(p, "cemetery").filter((id) => forestSpell(g, id)).map((id) => g.info(id).name)).size;

/** "If there are at least 5 Forestcraft spells with different names in your cemetery". */
export const fiveForestSpellNames = (g: GameReader, p: PlayerId): boolean => forestSpellNames(g, p) >= 5;

/** "Deal X damage to a [selected] follower, where X is this follower's attack" (BP09-003, 031, 064). */
export function* damageEqualToAttack(fx: EffectContext): Proc<void> {
  const target = fx.targets[0]?.[0];
  if (target === undefined || fx.game.card(fx.self)?.zone !== "field") return;
  yield* fx.dealDamage(target, fx.game.info(fx.self).attack ?? 0);
}

/**
 * "While this card is on your field, any Forest Bat you play costs 1 less" (BP09-070 and its
 * back face; two of them make it 2 less — ruling).
 */
export const forestBatsCostLess: FieldPassives["playCostOf"] = (g, self, card, player) =>
  player === g.controller(self) && forestBat(g, card) ? -1 : 0;

/** "Each Forest Bat on your field has Rush and Assail" (BP09-072 / 073). Only the card and its name are read. */
export const forestBatsRushAssail: FieldPassives["keywordsFor"] = (g, self, card) => {
  const c = g.card(card);
  return c?.zone === "field" && c.controller === g.card(self)?.controller && g.db.get(c.def).name === FOREST_BAT ? ["rush", "assail"] : [];
};

/** "You may summon a [matching] card from your hand" (BP09-087, 094). Hand cards are private: up to 1. */
export function* summonFromHand(fx: EffectContext, filter: (g: GameReader, id: CardId) => boolean): Proc<void> {
  const cards = fx.game.cards(fx.controller, "hand").filter((id) => filter(fx.game, id));
  yield* fx.putOntoField(yield* fx.chooseCards(cards, 0, 1));
}

/** "Look at the top card of your deck. You may bury it." (BP09-046 / 047; CR 5.11, 5.34) */
export function* lookAtTopMayBury(fx: EffectContext): Proc<void> {
  const top = fx.topCards(1);
  if (top.length === 0) return;
  yield* fx.lookAt(top);
  if (yield* fx.confirm(fx.controller, top[0])) yield* fx.bury(top);
}
