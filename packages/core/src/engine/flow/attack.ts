import { opponentOf, type CardId, type PlayerId } from "../../model/ids";
import { setEngaged } from "../actions/cards";
import { dealDamage, type DamageInstance } from "../actions/damage";
import { confirmationTiming } from "../abilities/confirmation";
import type { G } from "../runtime/context";
import type { Proc } from "../runtime/proc";
import { isOnField, leaderOf } from "../state/access";
import { characteristics, hasKeyword, infoDefId, isFollowerOnField } from "../state/characteristics";
import { makeReader } from "../query";
import { effectPreventsAttack } from "../state/effects";
import { thisTurn } from "../state/turn-counts";
import { quickWindow } from "./quick";

/**
 * CR 8.4.2.1 — has the follower remained on its controller's field since the start of the
 * turn? (`enteredFieldTurn` is set whenever a card is put onto a field.)
 */
function onFieldSinceTurnStart(g: G, id: CardId): boolean {
  const c = g.state.cards[id];
  return c !== undefined && c.enteredFieldTurn !== null && c.enteredFieldTurn < g.state.turn;
}

/**
 * CR 8.4.3 — legal attack targets for `attacker`:
 *  - engaged enemy followers (8.4.3.1); with Assail also reserved ones (12.11.2); never
 *    followers with Intimidate (12.12.2);
 *  - the enemy leader, only if the attacker has been on the field since the turn started
 *    (8.4.3.1) or has Storm (12.9.2) — so a follower that only evolved this turn, or attacks
 *    through Rush (12.10.2), can only attack followers;
 *  - Ward (12.8.2 iii): if an *engaged* Ward follower can be selected, one must be selected.
 *    A reserved Ward follower does not restrict (Ward is not in effect then), even for an
 *    Assail attacker (confirmed, docs/open-questions.md Q4).
 * Storm: that it also lifts the leader restriction of 8.4.3.1 is confirmed by the project
 * owner and by the official play guide (docs/open-questions.md Q1).
 * A card's "can't attack enemy leaders" (e.g. BP02-107) removes the leader.
 */
export function attackTargets(g: G, attacker: CardId): CardId[] {
  const c = g.state.cards[attacker];
  if (!c) return [];
  const opp = opponentOf(c.controller);
  const assail = hasKeyword(g, attacker, "assail");
  const followers = g.state.players[opp].zones.field.filter(
    (id) => isFollowerOnField(g, id) && (assail || g.state.cards[id]!.engaged) && !hasKeyword(g, id, "intimidate"),
  );
  const wards = followers.filter((id) => g.state.cards[id]!.engaged && hasKeyword(g, id, "ward"));
  if (wards.length > 0) return wards;
  const leaderAllowed =
    (onFieldSinceTurnStart(g, attacker) || hasKeyword(g, attacker, "storm")) &&
    !g.scripts[infoDefId(g, attacker)]?.cannotAttackLeader?.(makeReader(g), attacker);
  return leaderAllowed ? [...followers, leaderOf(g.state, opp)] : followers;
}

/** CR 8.4.2 — can this follower be selected as the attacking follower? */
export function canAttackWith(g: G, player: PlayerId, attacker: CardId): boolean {
  if (g.state.activePlayer !== player) return false;
  const c = g.state.cards[attacker];
  if (!c || c.controller !== player || !isFollowerOnField(g, attacker)) return false;
  if (c.engaged) return false; // 8.4.2 reserved followers only
  if (cannotAttackNow(g, attacker)) return false; // 8.4.3.2.1
  const eligible =
    onFieldSinceTurnStart(g, attacker) || // 8.4.2.1
    c.evolvedTurn === g.state.turn || // 8.4.2.1 "it evolved that turn"
    hasKeyword(g, attacker, "storm") || // 12.9.2
    hasKeyword(g, attacker, "rush"); // 12.10.2
  // 8.4.3.2 — an attack without a selectable target is illegal, so do not offer it.
  return eligible && attackTargets(g, attacker).length > 0;
}

/** CR 8.4.3.2.1 — printed "can't attack", a conditional form of it, or an effect that says so. */
function cannotAttackNow(g: G, attacker: CardId): boolean {
  const ban = g.scripts[infoDefId(g, attacker)]?.cannotAttack;
  if (ban === true) return true;
  if (typeof ban === "function" && ban(makeReader(g), attacker)) return true;
  return effectPreventsAttack(g.state, attacker);
}

/**
 * The damage a follower deals in combat (CR 8.4.9): its attack, or its defense while its
 * controller has a card with "your followers deal damage equal to their defense" on the field
 * (BP01-129/130; only attack damage, per their ruling).
 */
function combatDamageOf(g: G, follower: CardId): number {
  const ch = characteristics(g, follower);
  const controller = g.state.cards[follower]!.controller;
  const fromDefense = g.state.players[controller].zones.field.some(
    (id) => g.scripts[infoDefId(g, id)]?.field?.combatDamageFromDefense,
  );
  return (fromDefense ? ch.defense : ch.attack) ?? 0;
}

/** CR 8.4.4–8.4.11 — carry out an attack (legality checked by the caller). */
export function* performAttack(g: G, attacker: CardId, target: CardId): Proc<void> {
  const player = g.state.activePlayer;
  // 8.4.4 engage the attacking follower
  setEngaged(g, [attacker], true);
  // 8.4.5 it has "attacked"; attacker and a follower target are in combat (8.4.5.1)
  const targetIsLeader = g.state.cards[target]!.zone === "leader";
  g.state.attack = { attacker, target, targetIsLeader };
  thisTurn(g.state, player).followerAttacks += 1;
  g.emit({ type: "attackDeclared", player, attacker, target });
  // 8.4.6
  yield* confirmationTiming(g);
  // 8.4.7 / 8.4.8 the non-active player may play Quick cards and abilities
  yield* quickWindow(g, "attack");
  // 8.4.9 damage, if the attacking follower is still on the field
  if (isOnField(g.state, attacker)) {
    const inCombat = !targetIsLeader && isOnField(g.state, target);
    const damage: DamageInstance[] = [
      // CR 5.14.3.1 attack damage (also combat damage when the target is a follower, 5.14.3.2)
      { source: attacker, controller: player, target, amount: combatDamageOf(g, attacker), kind: "attack" },
    ];
    if (inCombat) {
      // 8.4.9.1 the attack target simultaneously deals damage to the attacker
      damage.push({ source: target, controller: g.state.cards[target]!.controller, target: attacker, amount: combatDamageOf(g, target), kind: "combat" });
    }
    dealDamage(g, damage); // Drain (CR 12.13) triggers on the attack damage: keyword-abilities.ts
    // 8.4.9.2 still in combat -> they have fought
    if (inCombat && isOnField(g.state, attacker) && isOnField(g.state, target)) {
      g.state.fights.push({
        a: attacker,
        b: target,
        aHasBane: hasKeyword(g, attacker, "bane"),
        bHasBane: hasKeyword(g, target, "bane"),
      });
      g.emit({ type: "fought", attacker, defender: target });
    }
  }
  // 8.4.10
  yield* confirmationTiming(g);
  // 8.4.11 the attack ends; they leave combat
  g.state.attack = null;
  g.emit({ type: "attackEnded", attacker });
}
