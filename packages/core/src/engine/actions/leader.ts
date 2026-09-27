import type { PlayerId } from "../../model/ids";
import type { G } from "../runtime/context";
import { thisTurn } from "../state/turn-counts";

/**
 * CR 5.27 — give a leader +X / -X defense (not damage). Leaders have no maximum defense
 * (play guide: "leaders can gain defense beyond their starting value"). A decrease counts
 * for Sanguine (CR 13.5.2.2).
 */
export function changeLeaderDefense(g: G, player: PlayerId, delta: number): void {
  if (delta === 0) return; // CR 1.3.2.2
  const ps = g.state.players[player];
  ps.leaderDefense += delta;
  if (delta < 0) {
    ps.leaderDefenseLostTurn = g.state.turn;
    thisTurn(g.state, player).leaderDefenseLost += 1; // BP05-069/081
  } else {
    thisTurn(g.state, player).leaderDefenseGained += 1; // BP18-111
    thisTurn(g.state, player).leaderDefenseGainedTotal += delta; // SP01-039
  }
  g.emit({ type: "leaderDefenseChanged", player, defense: ps.leaderDefense, delta });
}

/**
 * CR 5.27.2 — change a leader's defense to a value (e.g. BP02-075 "Change each enemy leader's
 * defense to 10"): a higher value counts as increased, a lower one as decreased.
 */
export function setLeaderDefense(g: G, player: PlayerId, value: number): void {
  changeLeaderDefense(g, player, value - g.state.players[player].leaderDefense);
}

/** CR 10.4.5 — "give your leader -X defense" as a cost needs at least X defense. */
export function canPayLeaderDefense(g: { state: G["state"] }, player: PlayerId, amount: number): boolean {
  return amount <= 0 || g.state.players[player].leaderDefense >= amount;
}
