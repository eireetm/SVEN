// The pending decision's options for one card on the table (pure functions, no state: tested in Node).
import type { Answer, CardId, Decision, MainAction, QuickAction } from "@sve/core";

/** One of the pending decision's actions, answered through the table. */
export type TableAction = MainAction | QuickAction;

/** The actions of the decision that use `card`: play it, evolve it, activate its abilities, attack with it. */
export function actionsFor(decision: Decision | undefined, card: CardId): TableAction[] {
  if (!decision || (decision.type !== "mainPhase" && decision.type !== "quick")) return [];
  const actions: readonly TableAction[] = decision.actions;
  return actions.filter((a) => (a.type === "attack" ? a.attacker === card : a.type !== "endMainPhase" && a.type !== "pass" && a.card === card));
}

/** The answer for one action of a main phase or quick decision. */
export function answerFor(decision: Decision, action: TableAction): Answer {
  return decision.type === "quick" ? { type: "quick", action: action as QuickAction } : { type: "mainPhase", action: action as MainAction };
}

/** The attack targets of `attacker` in the pending decision. */
export function attackTargets(decision: Decision | undefined, attacker: CardId): CardId[] {
  if (decision?.type !== "mainPhase") return [];
  return decision.actions.flatMap((a) => (a.type === "attack" && a.attacker === attacker ? [a.target] : []));
}

/** What dragging the card does: play it (its only play action), attack (it has attack actions), or nothing. */
export function dragKind(actions: readonly TableAction[]): "play" | "attack" | null {
  const plays = actions.filter((a) => a.type === "play").length;
  if (plays === 1) return "play";
  return actions.some((a) => a.type === "attack") ? "attack" : null;
}
