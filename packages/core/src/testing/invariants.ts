import type { CardDatabase } from "../data/database";
import type { Decision } from "../model/decision";
import type { PlayerId } from "../model/ids";
import { PLAYER_ZONES, type GameState } from "../model/state";
import { cloneJson, jsonEqual } from "../util/json";

/**
 * Structural invariants that must hold whenever the engine waits for a decision.
 * Returns a list of violations (empty = fine).
 */
export function checkInvariants(state: GameState, db: CardDatabase, decision: Decision | null): string[] {
  const errors: string[] = [];
  const seen = new Map<string, string>();
  const note = (id: string, where: string) => {
    if (seen.has(id)) errors.push(`${id} is in both ${seen.get(id)} and ${where}`);
    seen.set(id, where);
  };

  for (const p of [0, 1] as PlayerId[]) {
    const ps = state.players[p];
    for (const zone of PLAYER_ZONES) {
      for (const id of ps.zones[zone]) {
        note(id, `P${p}.${zone}`);
        const c = state.cards[id];
        if (!c) {
          errors.push(`${id} listed in P${p}.${zone} but missing from cards`);
          continue;
        }
        if (c.zone !== zone || c.controller !== p) errors.push(`${id} says ${c.zone}/P${c.controller} but is in P${p}.${zone}`);
        const def = db.get(c.def);
        if (def.token && !["field", "ex"].includes(zone)) errors.push(`token ${id} in ${zone} (CR 9.1.4)`);
        if (zone === "field" && c.evolvedWith !== null) {
          const e = state.cards[c.evolvedWith];
          if (!e || e.zone !== "evolveZone" || e.controller !== p) errors.push(`${id} linked to invalid evolve card ${c.evolvedWith}`);
        }
      }
    }
    // CR 3.2.4 — limits of play points (checked when no rules handling is pending).
    if (ps.maxPlayPoints < 0 || ps.maxPlayPoints > state.config.rules.maxPlayPointsCap) {
      errors.push(`P${p} max play points ${ps.maxPlayPoints} out of range`);
    }
    if (ps.playPoints < 0) errors.push(`P${p} play points ${ps.playPoints} < 0`);
    if (ps.evolutionPoints < 0 || ps.superEvolutionPoints < 0) errors.push(`P${p} negative evolution points`);
    if (decision?.type === "mainPhase") {
      if (ps.playPoints > ps.maxPlayPoints) errors.push(`P${p} play points above maximum at a main phase decision`);
      if (ps.zones.field.length > state.config.rules.fieldLimit) errors.push(`P${p} field over the limit`);
      if (ps.zones.ex.length > state.config.rules.exAreaLimit) errors.push(`P${p} EX area over the limit`);
      // After Confirmation Timing every evolve-zone card is linked (CR 11.6.1).
      const linked = new Set(ps.zones.field.map((id) => state.cards[id]?.evolvedWith));
      for (const id of ps.zones.evolveZone) if (!linked.has(id)) errors.push(`unlinked evolve card ${id} at a main phase decision`);
    }
  }
  for (const id of state.resolution) note(id, "resolution");
  for (const id of Object.keys(state.cards)) if (!seen.has(id)) errors.push(`${id} exists but is in no zone`);
  if (!jsonEqual(cloneJson(state), JSON.parse(JSON.stringify(state)))) errors.push("state is not plain JSON");
  return errors;
}

/** Non-token cards owned by each player, across all zones (conservation check). */
export function ownedCardCounts(state: GameState, db: CardDatabase): [number, number] {
  const counts: [number, number] = [0, 0];
  for (const c of Object.values(state.cards)) if (!db.get(c.def).token) counts[c.owner] += 1;
  return counts;
}
