import type { CardId, PlayerId } from "../model/ids";
import type { LossReason } from "../model/state";
import type { G } from "./runtime/context";
import { selectCards } from "./runtime/decide";
import type { Proc } from "./runtime/proc";
import { characteristics, hasKeyword } from "./state/characteristics";
import { exAreaLimit, fieldLimit } from "./state/limits";
import { moveCards, type MoveSpec } from "./state/zones";
import { endGame } from "./flow/end-game";

/**
 * CR 11 — rules handling. Each process inspects the same state and adds to a shared plan;
 * the plan is then executed at once, because simultaneous rules handling is executed
 * simultaneously (CR 11.1.3, 10.5.2.1).
 *
 * To add or change a rule, add or edit an entry of RULES_PROCESSES. Not implemented (no
 * supported card needs them): 11.8 racing, 11.10 drive points, 11.11 equipment (universes).
 */
export interface RulesPlan {
  losses: { player: PlayerId; reason: LossReason }[];
  /** Destroyed (CR 5.6). */
  destroy: Set<CardId>;
  /** Moved to the owner's cemetery without being destroyed (CR 11.4.1, 11.5.1). */
  toCemetery: Set<CardId>;
  /** Moved faceup to the evolve deck area (CR 11.6.1). */
  toEvolveDeck: Set<CardId>;
  /** Players whose play points are lowered to their maximum (CR 11.9.1). */
  capPlayPoints: Set<PlayerId>;
}

export interface RulesProcess {
  clause: string;
  collect(g: G, plan: RulesPlan): Proc<void>;
}

const BOTH: readonly PlayerId[] = [0, 1];

export const RULES_PROCESSES: readonly RulesProcess[] = [
  {
    clause: "11.2",
    *collect(g, plan) {
      for (const p of BOTH) {
        const ps = g.state.players[p];
        if (ps.leaderDefense <= 0) plan.losses.push({ player: p, reason: "leaderDefense" }); // 11.2.1
        if (ps.drewFromEmptyDeck) plan.losses.push({ player: p, reason: "deckOut" }); // 11.2.2
      }
    },
  },
  {
    clause: "11.3",
    *collect(g, plan) {
      for (const p of BOTH) {
        for (const id of g.state.players[p].zones.field) {
          const ch = characteristics(g, id);
          if (ch.type === "follower" && ch.defense !== null && ch.defense <= 0) plan.destroy.add(id); // 11.3.1
        }
      }
      // 11.3.2 — fought with a follower that has Bane since the previous rules handling.
      for (const f of g.state.fights) {
        if (f.bHasBane && g.state.cards[f.a]?.zone === "field") plan.destroy.add(f.a);
        if (f.aHasBane && g.state.cards[f.b]?.zone === "field") plan.destroy.add(f.b);
      }
    },
  },
  {
    clause: "11.4",
    *collect(g, plan) {
      for (const p of BOTH) {
        const field = g.state.players[p].zones.field;
        const limit = fieldLimit(g, p);
        if (field.length <= limit) continue;
        // 11.4.1 — the player keeps `limit` cards, the others go to the cemetery.
        const keep = yield* selectCards(g, p, "fieldLimitKeep", field, limit, limit);
        for (const id of field) if (!keep.includes(id)) plan.toCemetery.add(id);
      }
    },
  },
  {
    clause: "11.5",
    *collect(g, plan) {
      for (const p of BOTH) {
        const ex = g.state.players[p].zones.ex;
        const limit = exAreaLimit(g, p);
        if (ex.length <= limit) continue;
        const keep = yield* selectCards(g, p, "exLimitKeep", ex, limit, limit); // 11.5.1
        for (const id of ex) if (!keep.includes(id)) plan.toCemetery.add(id);
      }
    },
  },
  {
    clause: "11.6",
    *collect(g, plan) {
      // 11.6.1 — evolve-zone cards not linked to a card on the field.
      // (11.6.2 / 11.6.3 need multiple links, which the state model cannot represent: a
      // field card links to at most one evolve-zone card and re-evolving is impossible, 5.16.4.)
      for (const p of BOTH) {
        const linked = new Set(
          g.state.players[p].zones.field.map((id) => g.state.cards[id]!.evolvedWith).filter((x) => x !== null),
        );
        for (const id of g.state.players[p].zones.evolveZone) if (!linked.has(id)) plan.toEvolveDeck.add(id);
      }
    },
  },
  {
    clause: "11.7",
    *collect(g, plan) {
      // 11.7.1 — a card with Stack on the field without Stack counters goes to the cemetery.
      for (const p of BOTH) {
        for (const id of g.state.players[p].zones.field) {
          const c = g.state.cards[id]!;
          if ((c.counters.stack ?? 0) <= 0 && hasKeyword(g, id, "stack")) plan.toCemetery.add(id);
        }
      }
    },
  },
  {
    clause: "11.9",
    *collect(g, plan) {
      for (const p of BOTH) {
        const ps = g.state.players[p];
        if (ps.playPoints > ps.maxPlayPoints) plan.capPlayPoints.add(p); // 11.9.1
      }
    },
  },
];

function isEmpty(plan: RulesPlan): boolean {
  return (
    plan.losses.length === 0 &&
    plan.destroy.size === 0 &&
    plan.toCemetery.size === 0 &&
    plan.toEvolveDeck.size === 0 &&
    plan.capPlayPoints.size === 0
  );
}

/** One simultaneous rules-handling step. Returns whether anything was applied. */
function* rulesHandlingStep(g: G): Proc<boolean> {
  const plan: RulesPlan = {
    losses: [],
    destroy: new Set(),
    toCemetery: new Set(),
    toEvolveDeck: new Set(),
    capPlayPoints: new Set(),
  };
  for (const rule of RULES_PROCESSES) yield* rule.collect(g, plan);
  // 11.3.2 counts fights "after the previous instance of rules handling".
  g.state.fights = [];
  if (isEmpty(plan)) return false;

  for (const p of plan.capPlayPoints) {
    const ps = g.state.players[p];
    ps.playPoints = ps.maxPlayPoints;
    g.emit({ type: "playPointsChanged", player: p, playPoints: ps.playPoints, maxPlayPoints: ps.maxPlayPoints });
  }
  const specs: MoveSpec[] = [];
  for (const card of plan.destroy) specs.push({ card, to: "cemetery", reason: "destroy" });
  for (const card of plan.toCemetery) {
    if (!plan.destroy.has(card)) specs.push({ card, to: "cemetery", reason: "rules" });
  }
  for (const card of plan.toEvolveDeck) specs.push({ card, to: "evolveDeck", faceUp: true, reason: "rules" });
  if (specs.length > 0) moveCards(g, specs, "rules");
  if (plan.losses.length > 0) endGame(g, plan.losses);
  return true;
}

/** CR 10.5.2.1 — repeat rules handling until no process applies. */
export function* runRulesHandling(g: G): Proc<void> {
  while (yield* rulesHandlingStep(g)) {
    // keep going
  }
}
