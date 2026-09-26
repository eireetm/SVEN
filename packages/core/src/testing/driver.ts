import type { Answer, Decision, MainAction } from "../model/decision";
import type { CardId, PlayerId } from "../model/ids";
import type { PlayerZone, ZoneName } from "../model/state";
import type { Engine, GameConfigInput } from "../engine/engine";
import type { GameSession } from "../engine/session";
import { scenario, type ScenarioSide } from "./scenario";

/**
 * A terse way to drive a game in card tests.
 *
 * Card references are definition ids or printing numbers, optionally prefixed with "opp:"
 * (default: "me", player 0) and suffixed with "@zone", e.g. "BP01-006", "opp:V1",
 * "BP01-171@hand", "opp:leader". The scenario starts at player 0's main phase and, unless
 * configured otherwise, auto-answers every decision with a single legal answer except main
 * phase decisions.
 */
export interface DriveSpec {
  turn?: number;
  me?: ScenarioSide;
  opp?: ScenarioSide;
  config?: GameConfigInput;
  seed?: string | number;
}

const ZONE_ORDER: readonly ZoneName[] = [
  "field",
  "ex",
  "hand",
  "cemetery",
  "evolveZone",
  "evolveDeck",
  "banished",
  "deck",
  "leader",
  "resolution",
];

export class Driver {
  events: import("../events/types").GameEvent[] = [];

  constructor(readonly engine: Engine, readonly game: GameSession) {}

  get decision(): Decision | null {
    return this.game.decision;
  }

  private parse(ref: string): { player: PlayerId; def: string; zone: ZoneName | null } {
    let player: PlayerId = 0;
    let rest = ref;
    if (rest.startsWith("opp:")) {
      player = 1;
      rest = rest.slice(4);
    } else if (rest.startsWith("me:")) rest = rest.slice(3);
    const [name, zone] = rest.split("@") as [string, string | undefined];
    const def = name === "leader" ? name : this.engine.db.has(name) ? name : this.engine.db.ofPrinting(name).id;
    return { player, def, zone: (zone as ZoneName | undefined) ?? (name === "leader" ? "leader" : null) };
  }

  private matches(id: CardId, ref: string): boolean {
    const r = this.parse(ref);
    const c = this.game.state.cards[id];
    if (!c || c.controller !== r.player) return false;
    if (r.zone !== null && c.zone !== r.zone) return false;
    return r.def === "leader" ? c.zone === "leader" : c.def === r.def;
  }

  /** All card ids matching a reference, in zone order. */
  ids(ref: string): CardId[] {
    const r = this.parse(ref);
    const s = this.game.state;
    const zones = r.zone ? [r.zone] : ZONE_ORDER;
    return zones.flatMap((z) => (z === "resolution" ? s.resolution : s.players[r.player].zones[z as PlayerZone])).filter((id) =>
      this.matches(id, ref),
    );
  }

  id(ref: string): CardId {
    const [id] = this.ids(ref);
    if (id === undefined) throw new Error(`no card matches "${ref}"`);
    return id;
  }

  /** Answer the current decision directly. */
  answer(a: Answer): this {
    this.events.push(...this.game.act(a));
    return this;
  }

  private main(pick: (a: MainAction) => boolean, what: string): this {
    const d = this.game.decision;
    if (d?.type !== "mainPhase") throw new Error(`expected a main phase decision for ${what}, got ${d?.type ?? "none"}`);
    const action = d.actions.find(pick);
    if (!action) throw new Error(`${what} is not a legal action now`);
    return this.answer({ type: "mainPhase", action });
  }

  /** Can a card be played now (main phase)? */
  canPlay(ref: string): boolean {
    const d = this.game.decision;
    return d?.type === "mainPhase" && d.actions.some((a) => a.type === "play" && this.matches(a.card, ref));
  }

  play(ref: string): this {
    return this.main((a) => a.type === "play" && this.matches(a.card, ref), `play ${ref}`);
  }

  /**
   * Activate the `n`-th currently legal non-evolve activated ability of the card. `ep`: pay 1
   * evolution point in lieu of 1 play point (an advanced activated ability, CR 12.16.3).
   */
  activate(ref: string, n = 0, opts: { ep?: boolean } = {}): this {
    const d = this.game.decision;
    if (d?.type !== "mainPhase") throw new Error(`expected a main phase decision, got ${d?.type ?? "none"}`);
    const options = d.actions.filter(
      (a) => a.type === "activate" && this.matches(a.card, ref) && (a.useEvolutionPoint === true) === (opts.ep === true),
    );
    const action = options[n];
    if (!action) throw new Error(`activate #${n} of ${ref} is not legal now`);
    return this.answer({ type: "mainPhase", action });
  }

  canActivate(ref: string): boolean {
    const d = this.game.decision;
    return d?.type === "mainPhase" && d.actions.some((a) => a.type === "activate" && this.matches(a.card, ref));
  }

  /**
   * Evolve a follower. `into`: the evolved card to reveal, as a definition id — "<id>_back" for
   * the back face of a double-faced card (CR 4.6.4); default: the first legal one.
   */
  evolve(ref: string, opts: { ep?: boolean; sep?: boolean; into?: string } = {}): this {
    return this.main(
      (a) =>
        a.type === "evolve" &&
        this.matches(a.card, ref) &&
        a.useEvolutionPoint === (opts.ep ?? false) &&
        a.superEvolve === (opts.sep ?? false) &&
        (opts.into === undefined || this.evolveFace(a) === opts.into),
      `evolve ${ref}${opts.into ? ` into ${opts.into}` : ""}`,
    );
  }

  /** The definition of the face an evolve action reveals. */
  private evolveFace(a: Extract<MainAction, { type: "evolve" }>): string {
    const def = this.game.state.cards[a.evolveCard]!.def;
    return a.backFace ? this.engine.db.get(def).backFace! : def;
  }

  canEvolve(ref: string): boolean {
    const d = this.game.decision;
    return d?.type === "mainPhase" && d.actions.some((a) => a.type === "evolve" && this.matches(a.card, ref));
  }

  attack(attacker: string, target: string): this {
    return this.main(
      (a) => a.type === "attack" && this.matches(a.attacker, attacker) && this.matches(a.target, target),
      `attack ${attacker} -> ${target}`,
    );
  }

  /** Legal attack targets of a follower, as references ("opp:leader" or definition ids). */
  attackTargets(attacker: string): string[] {
    const d = this.game.decision;
    if (d?.type !== "mainPhase") return [];
    return d.actions.flatMap((a) =>
      a.type === "attack" && this.matches(a.attacker, attacker)
        ? [this.game.state.cards[a.target]!.zone === "leader" ? "opp:leader" : this.game.state.cards[a.target]!.def]
        : [],
    );
  }

  end(): this {
    return this.main((a) => a.type === "endMainPhase", "end the main phase");
  }

  /** Quick window: play a Quick card or activate a Quick ability of the card; pass when no card is given. */
  quick(ref?: string): this {
    const d = this.game.decision;
    if (d?.type !== "quick") throw new Error(`expected a quick window, got ${d?.type ?? "none"}`);
    const action = ref ? d.actions.find((a) => a.type !== "pass" && this.matches(a.card, ref)) : { type: "pass" as const };
    if (!action) throw new Error(`${ref} cannot be played in this quick window`);
    return this.answer({ type: "quick", action });
  }

  /** Answer a card selection with the given references (repeat a reference for copies). */
  pick(...refs: string[]): this {
    const d = this.game.decision;
    if (d?.type !== "selectCards") throw new Error(`expected a card selection, got ${d?.type ?? "none"}`);
    const chosen: CardId[] = [];
    for (const ref of refs) {
      const id = d.candidates.find((c) => !chosen.includes(c) && this.matches(c, ref));
      if (id === undefined) throw new Error(`"${ref}" is not a candidate (${d.reason})`);
      chosen.push(id);
    }
    return this.answer({ type: "selectCards", cards: chosen });
  }

  /** Answer a card selection with nothing. */
  none(): this {
    return this.pick();
  }

  yes(): this {
    return this.answer({ type: "confirm", yes: true });
  }

  no(): this {
    return this.answer({ type: "confirm", yes: false });
  }

  /** Answer a "choose" decision by option ids or labels. */
  choose(...keys: string[]): this {
    const d = this.game.decision;
    if (d?.type !== "choose") throw new Error(`expected a choice, got ${d?.type ?? "none"}`);
    const ids = keys.map((k) => {
      const o = d.options.find((x) => x.id === k || x.label === k);
      if (!o) throw new Error(`"${k}" is not an option: ${d.options.map((x) => x.label).join(", ")}`);
      return o.id;
    });
    return this.answer({ type: "choose", ids });
  }

  /** Answer an ordering decision (default: keep the proposed order). */
  order(...refs: string[]): this {
    const d = this.game.decision;
    if (d?.type !== "orderCards") throw new Error(`expected an ordering, got ${d?.type ?? "none"}`);
    const order: CardId[] = [];
    for (const ref of refs) order.push(d.cards.find((c) => !order.includes(c.id) && this.matches(c.id, ref))!.id);
    for (const c of d.cards) if (!order.includes(c.id)) order.push(c.id);
    return this.answer({ type: "orderCards", order });
  }

  /** Play a pending automatic ability (by its source reference, or the first one). */
  pending(ref?: string): this {
    const d = this.game.decision;
    if (d?.type !== "selectPending") throw new Error(`expected pending abilities, got ${d?.type ?? "none"}`);
    const id = ref ? d.options.find((p) => this.pendingSourceMatches(p, ref)) : d.options[0];
    if (id === undefined) throw new Error(`no pending ability of ${ref}`);
    return this.answer({ type: "selectPending", id });
  }

  /** Play all pending automatic abilities in the proposed order. */
  flush(): this {
    while (this.game.decision?.type === "selectPending") this.pending();
    return this;
  }

  private pendingSourceMatches(pendingId: string, ref: string): boolean {
    const p = this.game.state.pending.find((x) => x.id === pendingId);
    return p !== undefined && p.sourceDef === this.parse(ref).def;
  }

  // Queries -----------------------------------------------------------------------------

  private side(who: "me" | "opp"): PlayerId {
    return who === "me" ? 0 : 1;
  }

  zone(who: "me" | "opp", zone: PlayerZone): string[] {
    return this.game.state.players[this.side(who)].zones[zone].map((id) => this.game.state.cards[id]!.def);
  }

  field(who: "me" | "opp" = "me"): string[] {
    return this.zone(who, "field");
  }

  hand(who: "me" | "opp" = "me"): string[] {
    return this.zone(who, "hand");
  }

  ex(who: "me" | "opp" = "me"): string[] {
    return this.zone(who, "ex");
  }

  cemetery(who: "me" | "opp" = "me"): string[] {
    return this.zone(who, "cemetery");
  }

  /** [attack, defense] of a card. */
  stats(ref: string): [number | null, number | null] {
    const i = this.game.reader().info(this.id(ref));
    return [i.attack, i.defense];
  }

  keywords(ref: string): readonly string[] {
    return this.game.reader().info(this.id(ref)).keywords;
  }

  leader(who: "me" | "opp" = "me"): number {
    return this.game.state.players[this.side(who)].leaderDefense;
  }

  pp(who: "me" | "opp" = "me"): number {
    return this.game.state.players[this.side(who)].playPoints;
  }

  engaged(ref: string): boolean {
    return this.game.state.cards[this.id(ref)]!.engaged;
  }

  counters(ref: string, counter: string): number {
    return this.game.state.cards[this.id(ref)]!.counters[counter] ?? 0;
  }
}

/** Start a Driver on a scenario where player 0 ("me") is in their main phase. */
export function drive(engine: Engine, spec: DriveSpec = {}): Driver {
  const game = scenario(engine, {
    turn: spec.turn ?? 5,
    seed: spec.seed ?? "drive",
    players: [spec.me ?? {}, spec.opp ?? {}],
    config: { autoResolve: ["quick", "selectPending", "selectCards", "choose", "orderCards"], ...spec.config },
  });
  const d = new Driver(engine, game);
  d.events.push(...game.startupEvents);
  return d;
}
