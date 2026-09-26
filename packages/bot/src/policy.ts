import {
  defaultAnswer,
  legalSelection,
  type Answer,
  type CardDatabase,
  type CardId,
  type CardType,
  type CardView,
  type Decision,
  type GameReader,
  type HiddenCardView,
  type Keyword,
  type PlayerId,
  type PlayerView,
} from "./core";

/** What the fast policy needs to know about a card. */
export interface CardFacts {
  def: string;
  zone: string;
  controller: PlayerId;
  cost: number | null;
  keywords: readonly Keyword[];
  /** A rough worth, for "the best target" / "the cheapest card to discard". */
  value: number;
}

export type CardLookup = (id: CardId) => CardFacts | undefined;

/** A rough, card-agnostic worth of a card from its current numbers. */
export function staticValue(type: CardType, attack: number | null, defense: number | null, cost: number | null, keywords: readonly Keyword[]): number {
  const c = cost ?? 0;
  if (type === "follower" && attack !== null && defense !== null) {
    return attack + 0.6 * defense + 0.2 * c + (keywords.includes("ward") ? 1 : 0) + (keywords.includes("bane") ? 1.5 : 0);
  }
  if (type === "amulet") return 1.5 + 0.3 * c;
  if (type === "crest") return 2; // an effect that lasts in the EX area (CR 10.3.6), like evaluate.ts
  return 0.5 * c;
}

/**
 * Card facts as `view`'s player sees them (for decisions in the real game): the visible cards,
 * plus the cards the decision shows (searched or looked-at cards, by definition).
 */
export function lookupFromView(view: PlayerView, decision: Decision | null, db: CardDatabase): CardLookup {
  const facts = new Map<CardId, CardFacts>();
  const fromView = (c: CardView | HiddenCardView, zone: string) => {
    if (c.hidden) return;
    facts.set(c.id, { def: c.def, zone, controller: c.controller, cost: c.cost, keywords: c.keywords, value: staticValue(c.type, c.attack, c.defense, c.cost, c.keywords) });
  };
  for (const side of view.players) {
    if (side.leader) fromView(side.leader, "leader");
    for (const zone of ["hand", "field", "ex", "cemetery", "banished", "evolveDeck", "evolveZone"] as const) {
      for (const c of side[zone]) fromView(c, zone);
    }
  }
  for (const c of view.resolution) fromView(c, "resolution");
  const fromDef = (id: CardId, def: string) => {
    if (facts.has(id) || !db.has(def) || decision === null) return;
    const d = db.get(def);
    facts.set(id, { def, zone: "shown", controller: decision.player, cost: d.cost, keywords: [], value: staticValue(d.type, d.attack, d.defense, d.cost, []) });
  };
  if (decision?.type === "selectCards") {
    decision.candidates.forEach((id, i) => fromDef(id, decision.candidateDefs[i] ?? ""));
    for (const c of decision.peek ?? []) fromDef(c.id, c.def);
  } else if (decision?.type === "orderCards") {
    for (const c of decision.cards) fromDef(c.id, c.def);
  }
  return (id) => facts.get(id);
}

/** Card facts read from a (determinized) simulation, where everything may be looked at. */
export function lookupFromReader(reader: GameReader): CardLookup {
  const memo = new Map<CardId, CardFacts | undefined>();
  return (id) => {
    if (memo.has(id)) return memo.get(id);
    const c = reader.card(id);
    let facts: CardFacts | undefined;
    if (c) {
      const info = reader.info(id);
      facts = { def: c.def, zone: c.zone, controller: c.controller, cost: info.cost, keywords: info.keywords, value: staticValue(info.type, info.attack, info.defense, info.cost, info.keywords) };
    }
    memo.set(id, facts);
    return facts;
  };
}

/**
 * A quick, reasonable answer without looking ahead: used for the other decisions inside a
 * simulation (both players), and for decisions not worth simulating. Always legal.
 */
export function fastAnswer(d: Decision, lookup: CardLookup): Answer {
  switch (d.type) {
    case "chooseTurnOrder":
      return { type: "chooseTurnOrder", goFirst: true };
    case "mulligan":
      return { type: "mulligan", redraw: false };
    case "mainPhase":
    case "quick":
    case "orderCards":
      return defaultAnswer(d);
    case "selectPending":
      return { type: "selectPending", id: d.options[0]! };
    case "selectCards":
      return { type: "selectCards", cards: fastSelection(d, lookup) };
    case "choose": {
      const n = d.min > 0 ? d.min : Math.min(1, d.max);
      return { type: "choose", ids: d.options.slice(0, n).map((o) => o.id) };
    }
    case "confirm":
      return { type: "confirm", yes: true };
  }
}

function fastSelection(d: Extract<Decision, { type: "selectCards" }>, lookup: CardLookup): CardId[] {
  const mandatory = d.mandatory ?? [];
  const value = (id: CardId) => lookup(id)?.value ?? 0;
  const byValue = (best: boolean) => [...d.candidates].sort((a, b) => (best ? value(b) - value(a) : value(a) - value(b)));
  switch (d.reason) {
    // CR 7.4.3: engaging Ward followers at the end phase only protects.
    case "wardEngage":
      return legalSelection(d.candidates, mandatory, d.max);
    // CR 12.8.2 (i): enter engaged unless the follower could attack this turn.
    case "wardEnterEngaged": {
      const canAttack = (id: CardId) => (lookup(id)?.keywords ?? []).some((k) => k === "rush" || k === "storm");
      const calm = d.candidates.filter((id) => !canAttack(id));
      const n = Math.max(d.min, Math.min(d.max, calm.length));
      return legalSelection([...calm, ...d.candidates.filter((id) => canAttack(id))], mandatory, n);
    }
    // Pay and discard as little, and as little worth, as possible.
    case "cost":
    case "discard":
    case "handLimitDiscard":
      return legalSelection(byValue(false), mandatory, d.min);
    // Targets and choices: the most valuable enemy cards first, then own ones, as many as allowed.
    default: {
      const sorted = byValue(true);
      const enemies = sorted.filter((id) => lookup(id)?.controller !== d.player);
      const own = sorted.filter((id) => lookup(id)?.controller === d.player);
      return legalSelection([...enemies, ...own], mandatory, d.max);
    }
  }
}
