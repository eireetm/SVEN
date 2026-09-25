import type { CardId, PlayerId } from "../../model/ids";
import type { DamageInfo } from "../../script/types";
import type { G } from "../runtime/context";
import { chooseOptions } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
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

/** One replacement effect that changes an instance of damage (CR 5.14.2, 10.10). */
interface DamageReplacement {
  /** The new amount, given the current one (which is more than 0). */
  apply(amount: number): number;
  /** A persistent effect used up by replacing the damage, e.g. BP05-017 "the next time". */
  usesUp?: string;
}

interface DamageOutcome {
  amount: number;
  usedUp: string[];
}

/** The results of applying the replacement effects in every order (CR 10.10.2). */
function outcomes(amount: number, replacements: readonly DamageReplacement[]): DamageOutcome[] {
  const results = new Map<string, DamageOutcome>();
  const visit = (current: number, left: readonly DamageReplacement[], usedUp: string[]) => {
    // CR 1.3.2.2 — once the damage is 0 or less, it is not dealt at all: later replacement
    // effects have nothing to apply to (BP06-074 ruling).
    if (current <= 0 || left.length === 0) {
      const outcome = { amount: Math.max(0, current), usedUp: [...usedUp].sort() };
      results.set(`${outcome.amount}|${outcome.usedUp.join(",")}`, outcome);
      return;
    }
    left.forEach((r, i) => {
      const rest = left.filter((_, j) => j !== i);
      visit(r.apply(current), rest, r.usesUp ? [...usedUp, r.usesUp] : usedUp);
    });
  };
  // Many orders only when a few effects apply at once; with too many, keep the listed order.
  if (replacements.length > 6) {
    let current = amount;
    const usedUp: string[] = [];
    for (const r of replacements) {
      if (current <= 0) break;
      current = r.apply(current);
      if (r.usesUp) usedUp.push(r.usesUp);
    }
    return [{ amount: Math.max(0, current), usedUp }];
  }
  visit(amount, replacements, []);
  // Using up a prevention for the same result only harms its player: keep the other outcome.
  const all = [...results.values()];
  return all.filter(
    (o) => !all.some((x) => x !== o && x.amount === o.amount && x.usedUp.length < o.usedUp.length && x.usedUp.every((u) => o.usedUp.includes(u))),
  );
}

/**
 * CR 5.14 — deal damage. All instances are applied simultaneously (used for combat,
 * CR 8.4.9.1, and "each follower" effects). Returns the instances actually dealt.
 *  - 1.3.2.2: damage of 0 or less is not dealt at all, so nothing can change it (BP06-074
 *    ruling: +1 to 0 damage stays no damage);
 *  - 5.14.1.2: only followers on the field and leaders can take damage;
 *  - 5.14.2 / 10.2.1.3.2: effects that change damage are replacement effects: "cannot deal
 *    damage" (BP01-024), "doesn't take (combat / ability) damage" (BP02-019/090, BP04-103),
 *    passives of the source ("deals 4 more damage") and of other cards that change the damage
 *    a card deals (BP06-074 "your Yokai followers deal 1 more"), passives of the target
 *    ("reduce damage dealt to this by 1") and of other cards on the field, to followers
 *    ("your followers take 1 less damage from enemy abilities", BP02-004) or to leaders ("your
 *    leader doesn't take ability damage", BP05-108), "takes N instead of more" (BP05-101),
 *    "the next time it would take damage" (BP05-017, used up by it);
 *  - 10.10.2: when the order of several of them changes the result, the affected player (the
 *    controller of the leader or follower taking the damage) chooses it, as the resulting
 *    damage (BP06-074 rulings);
 *  - 5.14.3.2: combat damage is the damage an attacking follower and the follower it attacks
 *    deal each other;
 *  - 5.14.1 / 2.8.2: damage reduces defense; it may become negative (5.14.1.1).
 */
export function* dealDamage(g: G, instances: readonly DamageInstance[]): Proc<DamageInstance[]> {
  const { state } = g;
  const reader = makeReader(g);
  const dealt: (DamageInstance & { combat: boolean })[] = [];
  const usedUp = new Set<string>();
  for (const d of instances) {
    if (d.amount <= 0) continue;
    const t = state.cards[d.target];
    if (!t) continue;
    const toLeader = t.zone === "leader";
    if (!toLeader && !(t.zone === "field" && characteristics(g, d.target).type === "follower")) continue;
    const combat = d.kind === "combat" || (d.kind === "attack" && !toLeader);
    const info = (amount: number): DamageInfo => ({ ...d, amount, combat });
    const replacements: DamageReplacement[] = [];
    /** A passive's change, if it changes this damage at all. */
    const passive = (change: ((amount: number) => number) | undefined) => {
      if (change && change(d.amount) !== 0) replacements.push({ apply: (a) => a + change(a) });
    };
    const src = d.source !== null ? state.cards[d.source] : undefined;
    if (src && d.source !== null) {
      if (state.effects.some((e) => e.target === d.source && e.change.kind === "cannotDealDamage")) replacements.push({ apply: () => 0 });
      const own = src.zone === "field" ? activeScript(g, d.source)?.field?.damageDealt : undefined;
      if (own) passive((a) => own(reader, d.source!, info(a)));
    }
    const prevented = state.effects.some(
      (e) =>
        e.target === d.target &&
        e.change.kind === "preventDamage" &&
        (e.change.damage === "all" || (e.change.damage === "combat" && combat) || (e.change.damage === "ability" && d.kind === "ability")) &&
        effectInForce(state, e),
    );
    if (prevented) replacements.push({ apply: () => 0 });
    if (!toLeader) {
      const taken = activeScript(g, d.target)?.field?.damageTaken;
      if (taken) passive((a) => taken(reader, d.target, info(a)));
    }
    for (const p of [0, 1] as const) {
      for (const f of state.players[p].zones.field) {
        const field = activeScript(g, f)?.field;
        if (!field) continue;
        if (field.damageBy) passive((a) => field.damageBy!(reader, f, info(a)));
        const toTarget = toLeader ? field.damageToLeader : field.damageToFollower;
        if (toTarget) passive((a) => toTarget(reader, f, info(a)));
      }
    }
    for (const e of state.effects) {
      if (e.target !== d.target || !effectInForce(state, e)) continue;
      if (e.change.kind === "damageCap") {
        const max = e.change.max;
        replacements.push({ apply: (a) => Math.min(a, max) });
      }
    }
    const once = state.effects.find(
      (e) => e.target === d.target && e.change.kind === "preventNextDamage" && effectInForce(state, e) && !usedUp.has(e.id),
    );
    if (once) replacements.push({ apply: () => 0, usesUp: once.id });

    const results = outcomes(d.amount, replacements);
    let result = results[0]!;
    if (results.length > 1) {
      const labels = results.map((o, i) => ({
        id: String(i),
        label: (o.amount > 0 ? `Take ${o.amount} damage` : "Take no damage") + (o.usedUp.length > 0 ? " (uses up a prevention)" : ""),
      }));
      const [pick] = yield* chooseOptions(g, t.controller, "damageOrder", labels, 1, 1, d.source, d.target);
      result = results[Number(pick)]!;
    }
    for (const id of result.usedUp) usedUp.add(id);
    if (result.amount > 0) dealt.push({ ...d, amount: result.amount, combat });
  }
  if (usedUp.size > 0) state.effects = state.effects.filter((e) => !usedUp.has(e.id));
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
