import { defaultAnswer, enumerateAnswers, randomAnswer, type Answer, type Decision, type RngState } from "./core";
import { fastAnswer, type CardLookup } from "./policy";

/**
 * The answers worth comparing for a decision, at most `max`, in tie-break order (the first one
 * wins a tie). Main phase: every action but ending the main phase (the bot compares against
 * ending it), playing one of several identical cards only once. Selections and choices: every
 * answer when there are few, otherwise the fast answer, the smallest ones and random samples,
 * because "any number of cards" can have millions. Decisions with nothing to compare in the
 * short run (ordering cards, engaging Ward followers) get the fast answer only.
 */
export function candidateAnswers(d: Decision, lookup: CardLookup, rng: RngState, max: number): Answer[] {
  const out: Answer[] = [];
  const seen = new Set<string>();
  const add = (a: Answer, key = JSON.stringify(a)) => {
    if (out.length < max && !seen.has(key)) {
      seen.add(key);
      out.push(a);
    }
  };
  const sampled = (limit: number) => {
    const all = enumerateAnswers(d, Math.max(1, limit - 6));
    for (const a of all.answers) add(a);
    if (!all.complete) for (let i = 0; i < 12; i++) add(randomAnswer(rng, d));
  };
  switch (d.type) {
    case "mainPhase":
      for (const action of d.actions) {
        if (action.type === "endMainPhase") continue;
        let key = JSON.stringify(action);
        if (action.type === "play") {
          const f = lookup(action.card);
          if (f) key = `play|${f.def}|${f.zone}|${String(f.cost)}`;
        } else if (action.type === "evolve") {
          const f = lookup(action.evolveCard);
          if (f) key = JSON.stringify({ ...action, evolveCard: f.def });
        }
        add({ type: "mainPhase", action }, key);
      }
      break;
    case "quick":
      add(defaultAnswer(d));
      for (const action of d.actions) add({ type: "quick", action });
      break;
    case "selectPending":
      for (const id of d.options) add({ type: "selectPending", id });
      break;
    case "selectCards":
      add(fastAnswer(d, lookup));
      if (d.reason !== "wardEngage" && d.reason !== "wardEnterEngaged") sampled(max);
      break;
    case "choose":
      add(fastAnswer(d, lookup));
      sampled(max);
      break;
    case "confirm":
      add({ type: "confirm", yes: true });
      add({ type: "confirm", yes: false });
      break;
    case "orderCards":
    case "mulligan":
    case "chooseTurnOrder":
      add(fastAnswer(d, lookup));
      break;
  }
  return out;
}
