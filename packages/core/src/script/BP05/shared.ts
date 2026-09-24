// Abilities shared by several BP05 cards (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { Proc } from "../../engine/runtime/proc";
import type { ActivatedAbility, AutomaticAbility, FieldPassives } from "../types";
import {
  activated,
  atStartOfOpponentsMainPhase,
  atStartOfYourEndPhase,
  whenCardEntersYourField,
  whenThisTakesDamage,
  whenYouDraw,
  whenYouPlay,
  whenYourFollowerToCemetery,
} from "../helpers";
import { enemyLeader, hasTrait, inOpponentZone, isAmulet, isSpell, named, yourFollower } from "../targets";

/** "the number of [trait] cards in your cemetery" */
export const cemeteryWithTrait = (g: GameReader, p: PlayerId, trait: string): number =>
  g.cards(p, "cemetery").filter((id) => hasTrait(trait)(g, id)).length;

/** Forestcraft "if there are at least 3 Hunter cards in your cemetery" (BP05-001, 011, 012). */
export const threeHunters = (g: GameReader, p: PlayerId): boolean => cemeteryWithTrait(g, p, "狩人") >= 3;

/** Swordcraft "if there are at least 10 cards in opponents' cemeteries" (BP05-018, 019, 021, 025, 033). */
export const opponentCemeteryTen = (g: GameReader, p: PlayerId): boolean => g.cards(g.opponent(p), "cemetery").length >= 10;

/** Runecraft "the number of Idolatry cards on your field" (BP05-041, 045, 047, 048). */
export const idolatryOnField = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "field").filter((id) => hasTrait("アイドル")(g, id)).length;

/** Runecraft "the number of Mage followers on your field" (BP05-038, 039, 044). */
export const mageFollowers = (g: GameReader, p: PlayerId): number =>
  g.followers(p).filter((id) => hasTrait("魔法使い")(g, id)).length;

/** "If there is a [name] on your field" (the evolved card has the same name, CR 5.16.1.1.1). */
export const onYourField = (g: GameReader, p: PlayerId, name: string): boolean =>
  g.cards(p, "field").some((id) => named(name)(g, id));

export const GILNELISE = "Gilnelise, Omen of Craving";

/**
 * BP05-106 / 113 "If there is a Gilnelise, Omen of Craving on your field, this card costs 3 less
 * to play from the EX area."
 */
export const cravingDiscount = (g: GameReader, self: CardId, controller: PlayerId): number =>
  g.playZone(self) === "ex" && onYourField(g, controller, GILNELISE) ? -3 : 0;

/**
 * BP05-018 / 019 "{[act]} {[cost08]}: Select a card in an opponent's cemetery and play it for 0
 * play points." You play it: a follower or amulet goes onto your field, its abilities are yours,
 * and it goes to its owner's zones when it leaves the field; a spell goes back to its owner's
 * cemetery (rulings, as for BP03-109). If it can't be played then, nothing happens (ruling).
 */
export const playFromOpponentCemetery: ActivatedAbility = activated(
  { playPoints: 8 },
  {
    targets: [inOpponentZone("cemetery")],
    *resolve(fx) {
      const card = fx.targets[0]?.[0];
      if (card === undefined || fx.game.card(card)?.zone !== "cemetery") return;
      if (fx.game.canPlay(card, fx.controller, { cost: 0 })) yield* fx.playCard(card, { cost: 0 });
    },
  },
);

/** BP05-009 / 010 "Whenever a Puppet is put onto your field, give it {[attack]}+1 and Storm." */
export const puppetsGetStorm: AutomaticAbility = whenCardEntersYourField(
  {
    *resolve(fx) {
      const puppet = fx.data?.card;
      if (puppet === undefined || fx.game.card(puppet)?.zone !== "field") return;
      yield* fx.giveStats(puppet, 1, 0);
      yield* fx.giveKeyword(puppet, "storm");
    },
  },
  { filter: named("Puppet") },
);

/** BP05-027 / 028 "Whenever you play an amulet, select a follower on your field and give it {[defense]}+1." */
export const genoAmuletPlayed: AutomaticAbility = whenYouPlay(
  {
    targets: [yourFollower()],
    *resolve(fx) {
      const target = fx.targets[0]?.[0];
      if (target !== undefined) yield* fx.giveStats(target, 0, 1);
    },
  },
  isAmulet,
);

/**
 * BP05-052 … 063 "During your turn, whenever this follower takes ability damage, …": ability
 * damage is all damage but attack and combat damage (ruling). Damage that destroys it still
 * triggers the ability (BP05-053 / 063 rulings).
 */
export const whenTakesAbilityDamageOnYourTurn = (resolve: (fx: EffectContext) => Proc<void>): AutomaticAbility =>
  whenThisTakesDamage({ resolve }, { ability: true, onlyYourTurn: true });

/** BP05-055 / 056 "… give it {[attack]}+1 and Storm." */
export const disdainfulRage: AutomaticAbility = whenTakesAbilityDamageOnYourTurn(function* (fx) {
  yield* fx.giveStats(fx.self, 1, 0);
  yield* fx.giveKeyword(fx.self, "storm");
});

/** BP05-070 / 071 "While this card is on your field, any spell an opponent plays costs 1 more." (Two make it 2 more — ruling.) */
export const opponentSpellsCostMore: FieldPassives = {
  playCostOf: (g, self, card, player) => (player !== g.controller(self) && isSpell(g, card) ? 1 : 0),
};

/**
 * BP05-073 / 074 "At the start of your end phase, select an enemy leader. If there are 3 cards
 * or less in its controller's hand, deal it 3 damage."
 */
export const silenceAtEndPhase: AutomaticAbility = atStartOfYourEndPhase({
  targets: [enemyLeader()],
  *resolve(fx) {
    const leader = fx.targets[0]?.[0];
    if (leader !== undefined && fx.game.cards(fx.game.controller(leader), "hand").length <= 3) yield* fx.dealDamage(leader, 3);
  },
});

/**
 * BP05-076 / 077 "During your turn, whenever a follower is put from your field into the cemetery,
 * give this follower {[attack]}+1." (Tokens and followers put there as a cost count — rulings.)
 */
export const maskedPuppetGrows: AutomaticAbility = whenYourFollowerToCemetery(
  {
    *resolve(fx) {
      yield* fx.giveStats(fx.self, 1, 0);
    },
  },
  { onlyYourTurn: true },
);

/**
 * BP05-042 / 043 "Search your deck for a card that costs 1 play point, put it into your EX area,
 * then shuffle your deck. It costs 1 less to play this turn." (元のコスト: printed cost.)
 */
export function* searchCostOneToEx(fx: EffectContext): Proc<void> {
  for (const id of yield* fx.search((card) => fx.game.info(card).cost === 1, { to: "ex" })) {
    yield* fx.changePlayCost(id, -1, "endOfTurn");
  }
}

/** BP05-089 / 090 "At the start of each opponent's main phase, recover N play points." */
export const recoverOnOpponentsMainPhase = (n: number): AutomaticAbility =>
  atStartOfOpponentsMainPhase({
    *resolve(fx) {
      yield* fx.recoverPlayPoints(n);
    },
  });

/**
 * BP05-094 / 095 "Whenever you draw a card outside of your start phase, give this follower
 * {[attack]}+1/{[defense]}+1." Once per card drawn; adding a card to the hand otherwise is not
 * drawing (rulings).
 */
export const growsOnDraw: AutomaticAbility = whenYouDraw(
  {
    *resolve(fx) {
      yield* fx.giveStats(fx.self, 1, 1);
    },
  },
  { exceptYourStartPhase: true },
);

/**
 * BP05-103 / 104 "… if there are 2 cards or less in your hand, deal N damage to each enemy leader.
 * If there are 0 cards in your hand, deal N damage to each enemy follower on the field." (With 0
 * cards both happen — ruling.)
 */
export function* mjerrabaineStrikes(fx: EffectContext, damage: number): Proc<void> {
  const opponent = fx.game.opponent(fx.controller);
  if (fx.game.cards(fx.controller, "hand").length <= 2) yield* fx.dealDamage(fx.game.leader(opponent), damage);
  if (fx.game.cards(fx.controller, "hand").length === 0) yield* fx.dealDamageEach(fx.game.followers(opponent), damage);
}
