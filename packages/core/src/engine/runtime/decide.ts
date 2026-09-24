import type {
  Answer,
  CardRef,
  ChooseReason,
  ConfirmReason,
  Decision,
  MainAction,
  QuickAction,
  SelectReason,
} from "../../model/decision";
import type { CardId, PlayerId } from "../../model/ids";
import type { Anchor } from "../../model/state";
import { EngineError } from "../errors";
import type { G } from "./context";
import type { Proc } from "./proc";
import { infoDefId } from "../state/characteristics";

/**
 * The only way engine code asks a player something. If the decision has exactly one legal
 * answer and its type is configured to auto-resolve, that answer is used without yielding;
 * this is deterministic, so replays make the same choice.
 */
export function* decide(g: G, decision: Decision): Proc<Answer> {
  if ((g.state.config.autoResolve as readonly string[]).includes(decision.type)) {
    const forced = forcedAnswer(decision);
    if (forced) return forced;
  }
  const answer = yield { kind: "decision", decision };
  if (!answer) throw new EngineError(`no answer supplied for ${decision.type}`);
  if (answer.type !== decision.type) throw new EngineError(`answer ${answer.type} does not match ${decision.type}`);
  return answer;
}

/** The single legal answer of a decision, if it has exactly one. */
export function forcedAnswer(d: Decision): Answer | null {
  switch (d.type) {
    case "mainPhase":
      return d.actions.length === 1 ? { type: "mainPhase", action: d.actions[0]! } : null;
    case "quick":
      return d.actions.length === 1 ? { type: "quick", action: d.actions[0]! } : null;
    case "selectPending":
      return d.options.length === 1 ? { type: "selectPending", id: d.options[0]! } : null;
    case "selectCards":
      if (d.max === 0) return { type: "selectCards", cards: [] };
      if (d.min === d.candidates.length && d.max === d.candidates.length) {
        return { type: "selectCards", cards: [...d.candidates] };
      }
      return null;
    case "choose":
      if (d.max === 0) return { type: "choose", ids: [] };
      if (d.min === d.options.length && d.max === d.options.length) return { type: "choose", ids: d.options.map((o) => o.id) };
      return null;
    case "orderCards":
      return d.cards.length <= 1 ? { type: "orderCards", order: d.cards.map((c) => c.id) } : null;
    case "chooseTurnOrder":
    case "mulligan":
    case "confirm":
      return null;
  }
}

/** Mark a resumable flow position; the session checkpoints the state here. */
export function* anchor(g: G, a: Anchor): Proc<void> {
  g.state.anchor = a;
  yield { kind: "anchor" };
  g.state.anchor = null;
}

export function cardRefs(g: G, ids: readonly CardId[]): CardRef[] {
  return ids.map((id) => ({ id, def: g.state.cards[id]?.def ?? "" }));
}

/** Zones whose cards may be named in a cardsSelected event (CR 4.1.2 — not the hand or a deck). */
const PUBLIC_ZONE = new Set(["field", "ex", "cemetery", "banished", "evolveZone", "leader", "resolution"]);

/**
 * BP03-091 — while Diamond Master is on the field, an opponent who can select it must.
 * CR 1.3.2.3: satisfy as many such requirements as the selection count allows. Costs,
 * discards and attacks are not "selecting for an ability" (official rulings).
 */
function mandatoryTargets(g: G, player: PlayerId, reason: SelectReason, candidates: readonly CardId[]): CardId[] {
  if (reason !== "target" && reason !== "effect") return [];
  return candidates.filter((id) => {
    const c = g.state.cards[id];
    if (!c || c.zone !== "field" || c.controller === player) return false;
    return g.scripts[infoDefId(g, id)]?.mustBeSelected === true;
  });
}

export function* selectCards(
  g: G,
  player: PlayerId,
  reason: SelectReason,
  candidates: readonly CardId[],
  min: number,
  max: number,
  source: CardId | null = null,
  peek?: readonly CardId[],
): Proc<CardId[]> {
  if (min < 0 || max < min || max > candidates.length) {
    throw new EngineError(`bad selection bounds ${min}..${max} of ${candidates.length} (${reason})`);
  }
  if (max === 0) return []; // nothing can be selected: not a decision at all
  const mandatory = mandatoryTargets(g, player, reason, candidates);
  // Take as many forced cards as the maximum allows, and at least that many cards.
  const forced = Math.min(max, mandatory.length);
  const lo = Math.max(min, forced);
  const decision: Decision = {
    type: "selectCards",
    player,
    reason,
    candidates: [...candidates],
    candidateDefs: candidates.map((id) => g.state.cards[id]?.def ?? ""),
    min: lo,
    max,
    source,
  };
  if (mandatory.length > 0) decision.mandatory = mandatory;
  if (peek) decision.peek = cardRefs(g, peek);
  const a = yield* decide(g, decision);
  if (a.type !== "selectCards") throw new EngineError("unreachable");
  if ((reason === "target" || reason === "effect") && a.cards.length > 0) {
    const visible = a.cards.filter((id) => {
      const zone = g.state.cards[id]?.zone;
      return zone !== undefined && PUBLIC_ZONE.has(zone);
    });
    if (visible.length > 0) g.emit({ type: "cardsSelected", player, cards: visible, source });
  }
  return a.cards;
}

/** Choose `min`..`max` of the options; returns the chosen ids in option order. */
export function* chooseOptions(
  g: G,
  player: PlayerId,
  reason: ChooseReason,
  options: readonly { id: string; label: string }[],
  min = 1,
  max = 1,
  source: CardId | null = null,
  subject?: CardId,
): Proc<string[]> {
  if (min < 0 || max < min || max > options.length) {
    throw new EngineError(`bad choice bounds ${min}..${max} of ${options.length} (${reason})`);
  }
  if (max === 0) return [];
  const d: Decision = { type: "choose", player, reason, options: [...options], min, max, source };
  if (subject !== undefined) d.subject = cardRefs(g, [subject])[0]!;
  const a = yield* decide(g, d);
  if (a.type !== "choose") throw new EngineError("unreachable");
  return options.map((o) => o.id).filter((id) => a.ids.includes(id));
}

/** The player orders the cards (first = topmost). */
export function* orderCards(
  g: G,
  player: PlayerId,
  reason: "deckBottom" | "deckTop",
  cards: readonly CardId[],
  source: CardId | null = null,
): Proc<CardId[]> {
  if (cards.length <= 1) return [...cards];
  const a = yield* decide(g, { type: "orderCards", player, reason, cards: cardRefs(g, cards), source });
  if (a.type !== "orderCards") throw new EngineError("unreachable");
  return a.order;
}

export function* confirm(
  g: G,
  player: PlayerId,
  reason: ConfirmReason,
  source: CardId | null = null,
  subject?: CardId,
): Proc<boolean> {
  const d: Decision = { type: "confirm", player, reason, source };
  if (subject !== undefined) d.subject = cardRefs(g, [subject])[0]!;
  const a = yield* decide(g, d);
  if (a.type !== "confirm") throw new EngineError("unreachable");
  return a.yes;
}

export function* chooseMainAction(g: G, player: PlayerId, actions: MainAction[]): Proc<MainAction> {
  const a = yield* decide(g, { type: "mainPhase", player, actions });
  if (a.type !== "mainPhase") throw new EngineError("unreachable");
  return a.action;
}

export function* chooseQuickAction(
  g: G,
  player: PlayerId,
  timing: "attack" | "endPhase",
  actions: QuickAction[],
): Proc<QuickAction> {
  const a = yield* decide(g, { type: "quick", player, timing, actions });
  if (a.type !== "quick") throw new EngineError("unreachable");
  return a.action;
}
