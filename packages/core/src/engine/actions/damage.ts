import type { CardId, PlayerId } from "../../model/ids";
import type { DamageInfo } from "../../script/types";
import type { G } from "../runtime/context";
import { activeScript, characteristics } from "../state/characteristics";
import { effectInForce } from "../state/effects";
import { thisTurn } from "../state/turn-counts";
import { makeReader } from "../query";

export interface DamageInstance {
  source: CardId | null;
  /** Controller of the ability, or of the fighting card, that deals the damage (CR 3.1.2.4). */
  controller: PlayerId | null;
  target: CardId;
  amount: number;
  /** CR 5.14.3 */
  kind: "attack" | "combat" | "ability";
}

/**
 * CR 5.14 — deal damage. All instances are applied simultaneously (used for combat,
 * CR 8.4.9.1, and "each follower" effects). Returns the instances actually dealt.
 *  - 5.14.2 / 10.2.1.3.2: effects that change damage are replacement effects: "cannot deal
 *    damage" (the damage is not dealt, BP01-024 ruling), "doesn't take (combat) damage"
 *    (BP02-019/090), passives of the source on the field ("deals 4 more damage"), passives of
 *    the target ("reduce damage dealt to this by 1") and of other cards on the field, to
 *    followers ("your followers take 1 less damage from enemy abilities", BP02-004) or to
 *    leaders ("your leader doesn't take ability damage", BP05-108);
 *    "takes N instead of more" (BP05-101); "the next time it would take damage" (BP05-017), used
 *    up only by damage that would really be dealt (its ruling);
 *  - 5.14.3.2: combat damage is the damage an attacking follower and the follower it attacks
 *    deal each other;
 *  - 1.3.2.2: 0 or negative damage is not dealt at all;
 *  - 5.14.1.2: only followers on the field and leaders can take damage;
 *  - 5.14.1 / 2.8.2: damage reduces defense; it may become negative (5.14.1.1).
 */
export function dealDamage(g: G, instances: readonly DamageInstance[]): DamageInstance[] {
  const { state } = g;
  const reader = makeReader(g);
  const dealt: (DamageInstance & { combat: boolean })[] = [];
  for (const d of instances) {
    const t = state.cards[d.target];
    if (!t) continue;
    const toLeader = t.zone === "leader";
    if (!toLeader && !(t.zone === "field" && characteristics(g, d.target).type === "follower")) continue;
    const combat = d.kind === "combat" || (d.kind === "attack" && !toLeader);
    const info = (amount: number): DamageInfo => ({ ...d, amount, combat });
    let amount = d.amount;
    const src = d.source !== null ? state.cards[d.source] : undefined;
    if (src && d.source !== null) {
      if (state.effects.some((e) => e.target === d.source && e.change.kind === "cannotDealDamage")) continue;
      if (src.zone === "field") {
        amount += activeScript(g, d.source)?.field?.damageDealt?.(reader, d.source, info(amount)) ?? 0;
      }
    }
    // CR 5.14.2 prevention: all damage, combat damage (BP02-019), or ability damage (BP04-103,
    // which a leader can have too: everything but attack and combat damage, its ruling).
    const prevented = state.effects.some(
      (e) =>
        e.target === d.target &&
        e.change.kind === "preventDamage" &&
        (e.change.damage === "all" || (e.change.damage === "combat" && combat) || (e.change.damage === "ability" && d.kind === "ability")) &&
        effectInForce(state, e),
    );
    if (prevented) continue;
    if (!toLeader) {
      amount += activeScript(g, d.target)?.field?.damageTaken?.(reader, d.target, info(amount)) ?? 0;
      for (const p of [0, 1] as const) {
        for (const f of state.players[p].zones.field) {
          amount += activeScript(g, f)?.field?.damageToFollower?.(reader, f, info(amount)) ?? 0;
        }
      }
    } else {
      for (const p of [0, 1] as const) {
        for (const f of state.players[p].zones.field) {
          amount += activeScript(g, f)?.field?.damageToLeader?.(reader, f, info(amount)) ?? 0;
        }
      }
    }
    for (const e of state.effects) {
      if (e.target === d.target && e.change.kind === "damageCap" && effectInForce(state, e)) amount = Math.min(amount, e.change.max);
    }
    if (amount <= 0) continue;
    const once = state.effects.find((e) => e.target === d.target && e.change.kind === "preventNextDamage" && effectInForce(state, e));
    if (once) {
      state.effects = state.effects.filter((e) => e !== once);
      continue;
    }
    dealt.push({ ...d, amount, combat });
  }
  for (const d of dealt) {
    const c = state.cards[d.target]!;
    if (c.zone === "leader") {
      const ps = state.players[c.controller];
      ps.leaderDefense -= d.amount;
      ps.leaderDefenseLostTurn = state.turn; // CR 13.5.2.2
      thisTurn(state, c.controller).leaderDefenseLost += 1; // BP05-069/081
    } else {
      c.damage += d.amount;
    }
  }
  for (const d of dealt) {
    g.emit({ type: "damageDealt", source: d.source, target: d.target, amount: d.amount, kind: d.kind, combat: d.combat });
    const c = state.cards[d.target]!;
    if (c.zone === "leader") {
      const defense = state.players[c.controller].leaderDefense;
      g.emit({ type: "leaderDefenseChanged", player: c.controller, defense, delta: -d.amount });
    }
  }
  return dealt;
}
