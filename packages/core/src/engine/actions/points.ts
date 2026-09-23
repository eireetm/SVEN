import type { PlayerId } from "../../model/ids";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";

/** CR 3.2.4 / 1.3.2.4.1 — a value that would cross a limit becomes the limit. */
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function emitPlayPoints(g: G, p: PlayerId): void {
  const ps = g.state.players[p];
  g.emit({ type: "playPointsChanged", player: p, playPoints: ps.playPoints, maxPlayPoints: ps.maxPlayPoints });
}

/** CR 3.2.4.2 — play points are limited to [0, maximum play points]. */
export function setPlayPoints(g: G, p: PlayerId, value: number): void {
  const ps = g.state.players[p];
  const v = clamp(value, 0, ps.maxPlayPoints);
  if (v === ps.playPoints) return;
  ps.playPoints = v;
  emitPlayPoints(g, p);
}

/**
 * CR 3.2.4.1 — maximum play points are limited to [0, cap]. Lowering the maximum does not
 * lower current play points directly; rules handling 11.9 does that at Confirmation Timing.
 */
export function setMaxPlayPoints(g: G, p: PlayerId, value: number): void {
  const ps = g.state.players[p];
  const v = clamp(value, 0, g.state.config.rules.maxPlayPointsCap);
  if (v === ps.maxPlayPoints) return;
  ps.maxPlayPoints = v;
  emitPlayPoints(g, p);
}

/** CR 5.15 — recover play points (never above the maximum, 5.15.1.1). */
export function recoverPlayPoints(g: G, p: PlayerId, amount: number): void {
  if (amount <= 0) return; // CR 1.3.2.2
  setPlayPoints(g, p, g.state.players[p].playPoints + amount);
}

/** CR 10.4.4 — can the play-point part of a cost be paid? */
export function canPayPlayPoints(g: { state: G["state"] }, p: PlayerId, amount: number): boolean {
  return amount <= 0 || g.state.players[p].playPoints >= amount;
}

/** CR 10.4.4 — pay play points (callers check `canPayPlayPoints` first; 10.4.2.2). */
export function payPlayPoints(g: G, p: PlayerId, amount: number): void {
  if (amount <= 0) return; // CR 10.6.2.5.3 — considered paid
  const ps = g.state.players[p];
  if (ps.playPoints < amount) throw new EngineError(`player ${p} cannot pay ${amount} play points`);
  ps.playPoints -= amount;
  emitPlayPoints(g, p);
}

/** CR 3.2.5 / 3.2.6 — spend evolution / super-evolution points (lower limit 0). */
export function spendPoints(g: G, p: PlayerId, evolution: number, superEvolution: number): void {
  if (evolution === 0 && superEvolution === 0) return;
  const ps = g.state.players[p];
  if (ps.evolutionPoints < evolution || ps.superEvolutionPoints < superEvolution) {
    throw new EngineError(`player ${p} cannot spend ${evolution} EP / ${superEvolution} SEP`);
  }
  ps.evolutionPoints -= evolution;
  ps.superEvolutionPoints -= superEvolution;
  g.emit({
    type: "evolutionPointsChanged",
    player: p,
    evolutionPoints: ps.evolutionPoints,
    superEvolutionPoints: ps.superEvolutionPoints,
  });
}
