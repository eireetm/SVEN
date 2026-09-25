import type { MainAction } from "../../model/decision";
import type { PlayerId } from "../../model/ids";
import { confirmationTiming } from "../abilities/confirmation";
import { evolveActions, playEvolveAbility } from "../abilities/evolve";
import { canPlayActivated, playActivatedAbility } from "../abilities/play-ability";
import type { G } from "../runtime/context";
import { anchor, chooseMainAction } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { characteristics } from "../state/characteristics";
import { attackTargets, canAttackWith, performAttack } from "./attack";
import { canPlayCard, playCard } from "./play-card";

/** CR 7.3.3 — every legal main phase action for the active player (8.1.2: only complete ones). */
export function mainPhaseActions(g: G, player: PlayerId): MainAction[] {
  const ps = g.state.players[player];
  const actions: MainAction[] = [];
  // 8.2 play a card from the hand or EX area
  for (const card of [...ps.zones.hand, ...ps.zones.ex]) {
    if (canPlayCard(g, player, card, "main")) actions.push({ type: "play", card });
  }
  // 8.3 evolve abilities (12.2)
  actions.push(...evolveActions(g, player));
  // 8.3 other activated abilities (`ability` = position in the card's ability list), also those
  // valid in the hand or the EX area (CR 10.3.5, e.g. BP06-059 / 079)
  for (const card of [...ps.zones.field, ...ps.zones.hand, ...ps.zones.ex]) {
    characteristics(g, card).abilities.forEach(({ ability }, pos) => {
      if (ability.kind === "activated" && !ability.evolve && canPlayActivated(g, player, card, pos, "main")) {
        actions.push({ type: "activate", card, ability: pos });
      }
    });
  }
  // 8.4 attack
  for (const attacker of ps.zones.field) {
    if (!canAttackWith(g, player, attacker)) continue;
    for (const target of attackTargets(g, attacker)) actions.push({ type: "attack", attacker, target });
  }
  // 7.3.3 end the main phase
  actions.push({ type: "endMainPhase" });
  return actions;
}

function* performMainAction(g: G, player: PlayerId, action: Exclude<MainAction, { type: "endMainPhase" }>): Proc<void> {
  switch (action.type) {
    case "play":
      return yield* playCard(g, player, action.card);
    case "evolve":
      return yield* playEvolveAbility(g, player, action);
    case "activate":
      return yield* playActivatedAbility(g, player, action.card, action.ability);
    case "attack":
      return yield* performAttack(g, action.attacker, action.target);
  }
}

/**
 * CR 7.3.3–7.3.4 — the main phase action loop. This is a resumable position: the state is
 * checkpointed before every main phase decision.
 */
export function* mainPhaseLoop(g: G): Proc<void> {
  const player = g.state.activePlayer;
  for (;;) {
    yield* anchor(g, { kind: "mainPhase" });
    const action = yield* chooseMainAction(g, player, mainPhaseActions(g, player));
    if (action.type === "endMainPhase") return; // 7.3.4 -> end phase
    yield* performMainAction(g, player, action);
    yield* confirmationTiming(g); // 7.3.4
  }
}
