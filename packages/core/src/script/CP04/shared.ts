// Shared pieces of CP04 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { TargetSpec } from "../types";
import { hasTrait, isFollower, isSpell } from "../targets";

type Filter = (g: GameReader, id: CardId) => boolean;

/** Traits used by CP04 cards (日文种族): PriConne (プリコネ) and its guilds. */
export const priconne = hasTrait("プリコネ");
export const gourmetGuild = hasTrait("美食殿");
export const nightmare = hasTrait("NIGHTMARE");
export const friendshipClub = hasTrait("なかよし部");
export const dragonsNest = hasTrait("ドラゴンズネスト");
export const twinkleWish = hasTrait("トゥインクルウィッシュ");
export const geoTheogonia = hasTrait("〈ジオ・テオゴニア〉");
export const geoNiflhel = hasTrait("〈ジオ・ニヴルヘル〉");
export const sarendia = hasTrait("サレンディア救護院");
export const diabolos = hasTrait("ディアボロス");
export const lucentAcademy = hasTrait("ルーセント学院");
export const carmina = hasTrait("カルミナ");
export const elizabethPark = hasTrait("エリザベスパーク");

/** "a [matching] follower" */
export const followerThat =
  (f: Filter): Filter =>
  (g, id) =>
    isFollower(g, id) && f(g, id);
export const priconneFollower = followerThat(priconne);
export const priconneSpell: Filter = (g, id) => isSpell(g, id) && priconne(g, id);
/** "a card that costs N" (元のコスト: the printed cost). */
export const costs =
  (n: number): Filter =>
  (g, id) =>
    g.info(id).cost === n;

/** "another [matching] follower on your field" (CP04-034, 069, 070, 079 "While there's another ..."); safe in keyword passives. */
export function anotherOnYourField(g: GameReader, self: CardId, f: (g: GameReader, id: CardId) => boolean): boolean {
  const c = g.card(self);
  if (!c) return false;
  return g.cards(c.controller, "field").some((id) => id !== self && g.typeAndTraits(id).type === "follower" && f(g, id));
}
/** A trait check that only reads type and traits, for keyword passives. */
export const traitOf =
  (trait: string) =>
  (g: GameReader, id: CardId): boolean =>
    g.typeAndTraits(id).traits.includes(trait);

/** "Deal N damage to each enemy leader" */
export function* damageEnemyLeader(fx: EffectContext, n: number): Proc<void> {
  yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), n);
}

/** "Deal N damage to each enemy leader and enemy follower on the field" */
export function* damageEnemies(fx: EffectContext, n: number): Proc<void> {
  const opp = fx.game.opponent(fx.controller);
  yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], n);
}

/**
 * "If {[ub]} abilities you control have executed at least N other times this turn" (これを含めず; CP04-003, 043, 080, 089, 114):
 * the executions this turn besides this one, which was counted when it was played (CR 14.5.1.3).
 */
export const otherUnionBursts = (fx: EffectContext): number => fx.game.unionBurstsThisTurn(fx.controller) - 1;

/** "your max play points are 10" */
export const tenMaxPlayPoints = (g: GameReader, p: PlayerId): boolean => g.state.players[p].maxPlayPoints >= 10;

/**
 * "Look at the top card of your deck. If it's a [matching] card, you may reveal it and add it to your hand." Not taken, it stays
 * on top, unrevealed (CP04-108 / 113 rulings). Returns the card added to the hand.
 */
export function* mayTakeTopCard(fx: EffectContext, filter: Filter = () => true): Proc<CardId | null> {
  const top = fx.topCards(1);
  const [chosen] = yield* fx.selectCards(top.filter((id) => filter(fx.game, id)), 0, 1, fx.controller, top);
  if (chosen === undefined) return null;
  yield* fx.reveal([chosen]);
  const [inHand] = yield* fx.returnToHand([chosen]);
  return inHand ?? null;
}

/** "Look at the top N cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on the bottom in any order." */
export function* arrangeTop(fx: EffectContext, n: number): Proc<void> {
  const top = fx.topCards(n);
  const keep = yield* fx.chooseCards(top, 0, top.length);
  yield* fx.bottomInAnyOrder(top.filter((id) => !keep.includes(id)));
  yield* fx.putOnDeckInAnyOrder(keep, "top");
}

/** "You may summon a [matching] card from your hand." */
export function* maySummonFromHand(fx: EffectContext, filter: Filter): Proc<void> {
  const fits = fx.game.cards(fx.controller, "hand").filter((id) => filter(fx.game, id));
  yield* fx.putOntoField(yield* fx.chooseCards(fits, 0, 1));
}

/** "Put them into your EX area. They cost N less to play this turn." (the ones that got there, CR 4.8.3.2). */
export function* cheaperThisTurn(fx: EffectContext, cards: readonly CardId[], n: number): Proc<void> {
  for (const id of cards) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -n, "endOfTurn");
}

/** "Select your leader or another follower on your field" (CP04-041). */
export const yourLeaderOrAnotherFollower: TargetSpec = {
  count: 1,
  candidates: (g, c, self) => [g.leader(c), ...g.followers(c).filter((id) => id !== self)],
};
