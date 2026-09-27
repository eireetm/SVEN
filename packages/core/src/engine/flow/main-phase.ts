import type { MainAction } from "../../model/decision";
import { opponentOf, type PlayerId } from "../../model/ids";
import { confirmationTiming } from "../abilities/confirmation";
import { evolveActions, playEvolveAbility } from "../abilities/evolve";
import { canPlayActivated, cardsWithActivatedAbilities, playActivatedAbility } from "../abilities/play-ability";
import type { G } from "../runtime/context";
import { anchor, chooseMainAction } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { activeScript, characteristics, passiveSources } from "../state/characteristics";
import { ATTACKS_KEY, usesThisTurn } from "../state/access";
import { makeReader } from "../query";
import { attackTargets, canAttackWith, performAttack } from "./attack";
import { canPlayCard, cardsToPlayFrom, playCard } from "./play-card";

/** CR 7.3.3 — every legal main phase action for the active player (8.1.2: only complete ones). */
export function mainPhaseActions(g: G, player: PlayerId): MainAction[] {
  const ps = g.state.players[player];
  const actions: MainAction[] = [];
  // 8.2 play a card from the hand or EX area (or where a card effect allows it, CR 1.3.1)
  for (const card of cardsToPlayFrom(g, player)) {
    if (canPlayCard(g, player, card, "main")) actions.push({ type: "play", card });
  }
  // 8.3 evolve abilities (12.2)
  actions.push(...evolveActions(g, player));
  // 8.3 other activated abilities (`ability` = position in the card's ability list), also those
  // valid in the hand, the EX area or the cemetery (CR 10.3.5, e.g. BP06-059 / 079, BP07-038)
  for (const card of cardsWithActivatedAbilities(g, player)) {
    characteristics(g, card).abilities.forEach(({ ability }, pos) => {
      if (ability.kind !== "activated" || ability.evolve) return;
      if (canPlayActivated(g, player, card, pos, "main")) actions.push({ type: "activate", card, ability: pos });
      // CR 12.16.3 — an advanced activated ability may use 1 evolution point in lieu of 1 play point.
      if (ability.advanced && canPlayActivated(g, player, card, pos, "main", true)) {
        actions.push({ type: "activate", card, ability: pos, useEvolutionPoint: true });
      }
    });
  }
  // 8.4 attack
  for (const attacker of ps.zones.field) {
    if (!canAttackWith(g, player, attacker)) continue;
    for (const target of attackTargets(g, attacker)) actions.push({ type: "attack", attacker, target });
  }
  // 7.3.3 end the main phase — not while a follower must attack and can (CP04-012)
  if (!mustAttackFirst(g, player, actions)) actions.push({ type: "endMainPhase" });
  return actions;
}

/**
 * CP04-012 "each enemy follower on the field must attack once per turn if able" (`FieldPassives.forcesEnemyAttacks` of a card
 * on an opponent's side): while a follower of the active player that hasn't attacked this turn can attack, the main phase
 * can't end (rulings: other actions come first as the player likes; followers put onto the field later must attack too; one
 * that already attacked this turn need not attack again). A requirement that can't be met is not (CR 1.3.2): a follower
 * that can't attack is free.
 */
function mustAttackFirst(g: G, player: PlayerId, actions: readonly MainAction[]): boolean {
  const opp = opponentOf(player);
  const reader = makeReader(g);
  if (!passiveSources(g, opp).some((id) => activeScript(g, id)?.field?.forcesEnemyAttacks?.(reader, id) === true)) return false;
  return actions.some((a) => a.type === "attack" && usesThisTurn(g.state, g.state.cards[a.attacker]!, ATTACKS_KEY) === 0);
}

function* performMainAction(g: G, player: PlayerId, action: Exclude<MainAction, { type: "endMainPhase" }>): Proc<void> {
  switch (action.type) {
    case "play":
      return yield* playCard(g, player, action.card);
    case "evolve":
      return yield* playEvolveAbility(g, player, action);
    case "activate":
      return yield* playActivatedAbility(g, player, action.card, action.ability, action.useEvolutionPoint === true);
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
