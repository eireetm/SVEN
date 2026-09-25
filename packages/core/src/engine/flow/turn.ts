import { opponentOf } from "../../model/ids";
import { drawCards, setEngaged } from "../actions/cards";
import { setMaxPlayPoints, setPlayPoints } from "../actions/points";
import { confirmationTiming } from "../abilities/confirmation";
import type { G } from "../runtime/context";
import type { Proc } from "../runtime/proc";
import { restricted } from "../state/restrictions";
import { endPhase } from "./end-phase";
import { mainPhaseLoop } from "./main-phase";

/** CR 7.2 — start phase (a new turn begins). */
export function* startPhase(g: G): Proc<void> {
  const { state } = g;
  const player = state.activePlayer;
  const ps = state.players[player];
  state.turn += 1;
  state.phase = "start";
  ps.turnsPassed += 1; // 3.3.2
  g.emit({ type: "turnStarted", turn: state.turn, player });
  g.emit({ type: "phaseStarted", phase: "start", player });

  // 7.2.1 (never above the cap, 3.2.4.1), unless prohibited (BP05-006, CR 1.3.3)
  if (!restricted(state, player, "noStartPhaseMaxPlayPoints")) setMaxPlayPoints(g, player, ps.maxPlayPoints + 1);
  setPlayPoints(g, player, ps.maxPlayPoints); // 7.2.2
  // 7.2.3 refresh all cards on the field, except those that "don't refresh during their
  // controller's next start phase" (BP06-056): that effect is then over.
  const stay = new Set(
    state.effects.filter((e) => e.change.kind === "skipNextRefresh" && e.createdTurn < state.turn && ps.zones.field.includes(e.target)).map((e) => e.id),
  );
  const staying = state.effects.filter((e) => stay.has(e.id)).map((e) => e.target);
  setEngaged(g, ps.zones.field.filter((id) => !staying.includes(id)), false);
  if (stay.size > 0) state.effects = state.effects.filter((e) => !stay.has(e.id));
  const firstTurnOfFirstPlayer = player === state.firstPlayer && ps.turnsPassed === 1;
  // 7.2.4 / 7.2.4.1, unless prohibited (BP05-006, CR 1.3.3)
  if (!firstTurnOfFirstPlayer && !restricted(state, player, "noStartPhaseDraw")) drawCards(g, player, 1);
  yield* confirmationTiming(g); // 7.2.5
}

/** CR 7.3 — main phase. */
export function* mainPhase(g: G): Proc<void> {
  g.state.phase = "main";
  // 7.3.1 "at the start of the main phase" triggers
  g.emit({ type: "phaseStarted", phase: "main", player: g.state.activePlayer });
  yield* confirmationTiming(g); // 7.3.2
  yield* mainPhaseLoop(g); // 7.3.3 / 7.3.4
}

/**
 * CR 7.4.9 — the turn concludes; the non-active player becomes the active player, unless a
 * player takes another turn first (CR 5.28: the most recent instruction first, 5.28.1.1).
 * CR 5.26.2 — a player whose next turn is skipped does not begin it: the turn after it begins
 * instead (BP05-086 ruling: the opponent takes another turn).
 */
export function endTurn(g: G): void {
  let next = g.state.extraTurns.pop() ?? opponentOf(g.state.activePlayer);
  while (g.state.players[next].skipNextTurn) {
    g.state.players[next].skipNextTurn = false;
    g.emit({ type: "turnSkipped", player: next });
    next = opponentOf(next);
  }
  g.state.activePlayer = next;
}

/**
 * CR 7.1 — turns repeat until the game ends (GameOver unwinds this loop).
 * `resumeInMainPhase` continues a turn from the main phase checkpoint.
 */
export function* turnLoop(g: G, resumeInMainPhase: boolean): Proc<void> {
  if (resumeInMainPhase) {
    yield* mainPhaseLoop(g);
    yield* endPhase(g);
    endTurn(g);
  }
  for (;;) {
    yield* startPhase(g);
    yield* mainPhase(g);
    yield* endPhase(g);
    endTurn(g);
  }
}
