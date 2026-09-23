import type { QuickAction } from "../../model/decision";
import { opponentOf, type PlayerId } from "../../model/ids";
import { canPlayActivated, playActivatedAbility } from "../abilities/play-ability";
import { confirmationTiming } from "../abilities/confirmation";
import type { G } from "../runtime/context";
import { chooseQuickAction } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { characteristics } from "../state/characteristics";
import { canPlayCard, playCard } from "./play-card";

/** CR 7.4.5 / 8.4.7 — Quick cards and Quick activated abilities the player can play now. */
export function quickActions(g: G, player: PlayerId): QuickAction[] {
  const ps = g.state.players[player];
  const actions: QuickAction[] = [];
  for (const card of [...ps.zones.hand, ...ps.zones.ex]) {
    if (canPlayCard(g, player, card, "quick")) actions.push({ type: "play", card });
  }
  for (const card of ps.zones.field) {
    characteristics(g, card).abilities.forEach((_ref, pos) => {
      if (canPlayActivated(g, player, card, pos, "quick")) actions.push({ type: "activate", card, ability: pos });
    });
  }
  actions.push({ type: "pass" });
  return actions;
}

/**
 * CR 8.4.7–8.4.8 (after an attack) and 7.4.5–7.4.6 (end phase): the non-active player plays
 * a Quick card or ability or does nothing; after each play Confirmation Timing occurs and
 * the window repeats.
 */
export function* quickWindow(g: G, timing: "attack" | "endPhase"): Proc<void> {
  const player = opponentOf(g.state.activePlayer);
  for (;;) {
    const action = yield* chooseQuickAction(g, player, timing, quickActions(g, player));
    if (action.type === "pass") return;
    if (action.type === "play") yield* playCard(g, player, action.card);
    else yield* playActivatedAbility(g, player, action.card, action.ability);
    yield* confirmationTiming(g);
  }
}
