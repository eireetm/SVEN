import type { Answer, Decision } from "../../model/decision";
import { jsonEqual } from "../../util/json";

/**
 * Check an answer against the decision that is currently pending. Returns an error message,
 * or null when the answer is legal. Procedures trust validated answers, so this must be
 * complete for every decision type.
 */
export function validateAnswer(d: Decision, a: Answer): string | null {
  if (a.type !== d.type) return `expected a "${d.type}" answer, got "${a.type}"`;
  switch (d.type) {
    case "chooseTurnOrder":
      return typeof (a as { goFirst?: unknown }).goFirst === "boolean" ? null : "goFirst must be a boolean";
    case "mulligan": {
      const m = a as Extract<Answer, { type: "mulligan" }>;
      if (typeof m.redraw !== "boolean") return "redraw must be a boolean";
      if (m.bottomOrder === undefined) return null;
      if (!m.redraw) return "bottomOrder is only allowed when redrawing";
      if (!isPermutation(m.bottomOrder, d.hand)) return "bottomOrder must be a permutation of the hand";
      return null;
    }
    case "mainPhase": {
      const action = (a as Extract<Answer, { type: "mainPhase" }>).action;
      return d.actions.some((x) => jsonEqual(x, action)) ? null : "not a legal main phase action";
    }
    case "quick": {
      const action = (a as Extract<Answer, { type: "quick" }>).action;
      return d.actions.some((x) => jsonEqual(x, action)) ? null : "not a legal quick action";
    }
    case "selectPending": {
      const id = (a as Extract<Answer, { type: "selectPending" }>).id;
      return d.options.includes(id) ? null : "not a pending ability of this player";
    }
    case "selectCards": {
      const cards = (a as Extract<Answer, { type: "selectCards" }>).cards;
      if (!Array.isArray(cards)) return "cards must be an array";
      if (new Set(cards).size !== cards.length) return "cards must be distinct";
      if (cards.length < d.min || cards.length > d.max) return `select between ${d.min} and ${d.max} cards`;
      for (const c of cards) if (!d.candidates.includes(c)) return `${String(c)} is not a candidate`;
      if (d.mandatory && d.mandatory.length > 0) {
        const got = cards.filter((c) => d.mandatory!.includes(c)).length;
        // CR 1.3.2.3 — include as many of the forced cards as this selection's size allows.
        if (got !== Math.min(cards.length, d.mandatory.length)) return "selection must include the required cards";
      }
      return null;
    }
    case "choose": {
      const ids = (a as Extract<Answer, { type: "choose" }>).ids;
      if (!Array.isArray(ids)) return "ids must be an array";
      if (new Set(ids).size !== ids.length) return "options must be distinct";
      if (ids.length < d.min || ids.length > d.max) return `choose between ${d.min} and ${d.max} options`;
      for (const id of ids) if (!d.options.some((o) => o.id === id)) return `${String(id)} is not an option`;
      return null;
    }
    case "orderCards": {
      const order = (a as Extract<Answer, { type: "orderCards" }>).order;
      if (!Array.isArray(order)) return "order must be an array";
      return isPermutation(order, d.cards.map((c) => c.id)) ? null : "order must be a permutation of the cards";
    }
    case "confirm":
      return typeof (a as { yes?: unknown }).yes === "boolean" ? null : "yes must be a boolean";
  }
}

function isPermutation(xs: readonly string[], ys: readonly string[]): boolean {
  if (xs.length !== ys.length) return false;
  const a = [...xs].sort();
  const b = [...ys].sort();
  return a.every((x, i) => x === b[i]);
}
