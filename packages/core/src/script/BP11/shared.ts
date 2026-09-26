// Shared pieces of BP11 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { CardMove } from "../../events/types";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { Proc } from "../../engine/runtime/proc";
import type { CustomCost } from "../types";
import { and, hasTrait, isFollower, isToken, named } from "../targets";

/** 乗物 (Mount) and 荒野 (Wasteland) cards. */
export const mount = hasTrait("乗物");
export const wasteland = hasTrait("荒野");
/** A Wasteland follower. */
export const wastelandFollower = and(isFollower, wasteland);
/** A Pixie (妖精) token (BP11-007, 011). */
export const pixieToken = and(isToken, hasTrait("妖精"));

/** The Mount tokens (BP11-T03 / T04 / T05). */
export const STEED = "Dutiful Steed";
export const BIKE = "Bullet Bike";
export const CARRIER = "Arcane Personnel Carrier";

/** Is it `p`'s turn ("during your turn", "once on each of your turns")? */
export const yourTurn = (g: GameReader, p: PlayerId): boolean => g.activePlayer === p;

/** "If there's a [name] on your field". */
export const onYourField = (g: GameReader, p: PlayerId, name: string): boolean => g.cards(p, "field").some((id) => named(name)(g, id));

/** "Mount cards on your field and/or in your EX area" — counted together (BP11-014, 114 rulings). */
export const mountsOnFieldAndEx = (g: GameReader, p: PlayerId): number =>
  [...g.cards(p, "field"), ...g.cards(p, "ex")].filter((id) => mount(g, id)).length;

/** A card that left the field was a Mount there (its look-back information, CR 10.7.4.1). */
export const leftAsMount = (m: CardMove): boolean => m.before?.traits?.includes("乗物") === true;

/** "The number of cards with different base costs in your cemetery" (元のコストの種類数, BP11-036, 039, 041). */
export const distinctCostsInCemetery = (g: GameReader, p: PlayerId): number =>
  new Set(g.cards(p, "cemetery").flatMap((id) => {
    const cost = g.info(id).cost;
    return cost === null ? [] : [cost];
  })).size;

/** Is there room in the player's field / EX area (CR 4.4.4, 4.8.3)? */
export const hasRoom = (g: GameReader, p: PlayerId, zone: "field" | "ex"): boolean =>
  g.cards(p, zone).length < (zone === "field" ? g.fieldLimit(p) : g.exAreaLimit(p));

/**
 * "You may put a [token] onto your field or into your EX area" (BP11-106, 115): either, or
 * neither — also when one of them is full (rulings). Only zones with room are offered.
 */
export function* tokenOntoFieldOrEx(fx: EffectContext, name: string): Proc<void> {
  const options: { id: string; label: string }[] = [];
  if (hasRoom(fx.game, fx.controller, "field")) options.push({ id: "field", label: `Put a ${name} onto your field` });
  if (hasRoom(fx.game, fx.controller, "ex")) options.push({ id: "ex", label: `Put a ${name} into your EX area` });
  if (options.length === 0) return;
  options.push({ id: "none", label: "Don't put it" });
  const [pick] = yield* fx.choose(options);
  if (pick === "field") yield* fx.summon([name]);
  else if (pick === "ex") yield* fx.tokensToEx([name]);
}

/** "Engage [n] [matching] followers on your field" — only reserved ones can be engaged (CR 5.4). */
export function engageFollowers(filter: (g: GameReader, id: CardId) => boolean, n: number): CustomCost {
  const reserved = (g: GameReader, c: PlayerId) => g.followers(c).filter((id) => g.card(id)?.engaged === false && filter(g, id));
  return {
    canPay: (g, c) => reserved(g, c).length >= n,
    *pay(fx) {
      const chosen = yield* fx.chooseCards(reserved(fx.game, fx.controller), n, n);
      yield* fx.engage(chosen);
    },
  };
}
