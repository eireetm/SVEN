/**
 * sve-server's SimpleFoolAI (笨AI), imitated: it evolves its most expensive follower, plays its most expensive card, attacks
 * with its first follower at its first target (the leader first, as their GetAttackAbleTarget lists it), then ends. Their
 * GoodAI and PlannerAI let it play the opponent in the games they copy to check a move (Battle.CloneForAI).
 */
import { defaultAnswer, legalSelection, type Answer, type Decision, type Engine, type GameSession, type MainAction, type QuickAction } from "../../packages/core/src";
import { SBattle, endTurn, enhanceOption, mainAnswer, quickAnswer } from "./model";

/** Its answer to any decision. */
export function foolAnswer(engine: Engine, session: GameSession): Answer {
  const d = session.decision!;
  switch (d.type) {
    case "chooseTurnOrder":
      return { type: "chooseTurnOrder", goFirst: true };
    case "mulligan":
      return { type: "mulligan", redraw: false };
    case "selectCards":
      // A Ward follower put onto the field: their DoChoice ["竖直登场", "横置登场"], the first option (it stays standing).
      if (d.reason === "wardEnterEngaged") return { type: "selectCards", cards: legalSelection(d.candidates, d.mandatory ?? [], d.min) };
      // ChooseCard: the first cards offered, as many as asked.
      return { type: "selectCards", cards: legalSelection(d.candidates, d.mandatory ?? [], d.max) };
    case "choose": {
      // Card.Refresh plays at the highest enhance cost it can afford; DoChoice: the first option.
      const enhance = d.reason === "playOption" ? enhanceOption(d) : null;
      if (enhance) return { type: "choose", ids: [enhance] };
      return { type: "choose", ids: d.options.slice(0, Math.max(d.min, Math.min(1, d.max))).map((o) => o.id) };
    }
    case "confirm":
      return { type: "confirm", yes: true };
    case "mainPhase":
    case "quick":
      return foolAction(new SBattle(engine, session, d.player), d);
    default:
      return defaultAnswer(d);
  }
}

function foolAction(b: SBattle, d: Extract<Decision, { type: "mainPhase" | "quick" }>): Answer {
  const answer = (a: MainAction | QuickAction): Answer => (d.type === "quick" ? quickAnswer(a as QuickAction) : mainAnswer(a as MainAction));
  const actions = d.actions as readonly (MainAction | QuickAction)[];
  const cost = (id: string) => b.card(id)?.cost ?? 0;
  // Evolve the most expensive follower that can evolve with an evolution point when there is one (without one otherwise).
  const useEp = b.me.ep > 0;
  const evolves = actions.filter((a): a is Extract<MainAction, { type: "evolve" }> => a.type === "evolve" && !a.superEvolve && (a.useEvolutionPoint === true) === useEp);
  if (evolves.length > 0) return answer([...evolves].sort((x, y) => cost(y.card) - cost(x.card))[0]!);
  // Play the most expensive card it can.
  const plays = actions.filter((a) => a.type === "play") as { type: "play"; card: string }[];
  if (plays.length > 0) return answer([...plays].sort((x, y) => cost(y.card) - cost(x.card))[0]!);
  // The first follower that can attack, at its first target: the leader when it can be attacked.
  const attack = actions.find((a) => a.type === "attack") as Extract<MainAction, { type: "attack" }> | undefined;
  if (attack) {
    const leader = b.enemy.leader.id;
    const atLeader = actions.find((a) => a.type === "attack" && a.attacker === attack.attacker && a.target === leader);
    return answer(atLeader ?? attack);
  }
  return endTurn(d);
}
