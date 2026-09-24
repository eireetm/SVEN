import { discardCards, setEngaged } from "../actions/cards";
import { confirmationTiming } from "../abilities/confirmation";
import type { G } from "../runtime/context";
import { selectCards } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { hasKeyword, isFollowerOnField } from "../state/characteristics";
import { handLimit } from "../state/limits";
import { quickWindow } from "./quick";

/** CR 7.4 — end phase of the active player's turn. */
export function* endPhase(g: G): Proc<void> {
  const player = g.state.activePlayer;
  const ps = g.state.players[player];
  g.state.phase = "end";
  // 7.4.1 "at the start of the end phase" triggers
  g.emit({ type: "phaseStarted", phase: "end", player });
  yield* confirmationTiming(g); // 7.4.2

  // 7.4.3 engage any number of Ward followers (12.8.2 ii). Only reserved ones can be engaged.
  const wards = ps.zones.field.filter(
    (id) => isFollowerOnField(g, id) && !g.state.cards[id]!.engaged && hasKeyword(g, id, "ward"),
  );
  if (wards.length > 0) {
    const chosen = yield* selectCards(g, player, "wardEngage", wards, 0, wards.length);
    setEngaged(g, chosen, true);
  }
  yield* confirmationTiming(g); // 7.4.4

  yield* quickWindow(g, "endPhase"); // 7.4.5 / 7.4.6

  // 7.4.7 discard down to the hand limit, with Confirmation Timing after each discard
  for (;;) {
    const excess = ps.zones.hand.length - handLimit(g, player);
    if (excess <= 0) break;
    const chosen = yield* selectCards(g, player, "handLimitDiscard", ps.zones.hand, excess, excess);
    discardCards(g, chosen);
    yield* confirmationTiming(g);
  }

  // 7.4.8 "until the end of the turn" effects end; "... and during each opponent's next turn"
  // effects end with the first turn of the controller's opponent after their creation turn.
  const { turn } = g.state;
  // "This turn" next-play cost changes (BP03-038) and delayed triggers (BP03-089) end too, and
  // so do restrictions on this player's turn (BP05-006).
  g.state.nextPlay = [];
  g.state.restrictions = g.state.restrictions.filter((r) => !(r.player === player && turn > r.createdTurn));
  g.state.delayed = g.state.delayed.filter((d) => d.until !== "endOfTurn");
  g.state.effects = g.state.effects.filter(
    (e) =>
      e.until !== "endOfTurn" &&
      !(e.until === "endOfOpponentsNextTurn" && e.controller !== player && turn > e.createdTurn),
  );
}
