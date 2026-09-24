import type { CardDatabase } from "../../data/database";
import type { DefId, PrintingId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { CardInstance, GameState, PlayerZone, ZoneName } from "../../model/state";
import type { CardMove, MoveReason } from "../../events/types";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";
import { getCard, nextSeq } from "./access";
import { characteristics } from "./characteristics";
import { thisTurn } from "./turn-counts";

/**
 * Low-level zone movement. No decisions, no limit checks: callers that need CR 4.4.4.2 /
 * 4.8.3.2 (zone limits) or replacement choices use the procedures in engine/actions.
 */

export interface MoveSpec {
  card: CardId;
  to: PlayerZone | "resolution";
  /** Player whose zone receives the card. Default: the card's owner (CR 4.1.6). */
  player?: PlayerId;
  /** Required when moving into a deck (CR 4.5.2.1 top / bottom). */
  position?: "top" | "bottom";
  /** Default: faceup in public zones, facedown otherwise (CR 4.2.3.3). */
  faceUp?: boolean;
  /** Default: reserved (CR 4.2.2.3). */
  engaged?: boolean;
  /**
   * Keep persistent effects applied to the card (CR 4.8.3.3 EX area -> field,
   * 10.6.2.1.3 EX area -> resolution zone, 10.6.2.8.1.1 resolution zone -> field).
   * Otherwise they end, because the moved card is a new card (CR 4.1.4, 10.9.2).
   */
  keepEffects?: boolean;
  /**
   * Keep the card's counters (CR 10.6.2.1.3 EX area -> resolution zone, 10.6.2.8.1.1 resolution
   * zone -> field). A card moved from the EX area directly onto the field keeps its effects
   * (CR 4.8.3.3) and its counters (BP03-102 ruling) without asking.
   */
  keepCounters?: boolean;
  /** Overrides the batch's reason for this card (e.g. rules handling destroys some cards and
   *  moves others to the cemetery in the same simultaneous step, CR 11.1.3). */
  reason?: MoveReason;
  /**
   * CR 5.22 — keep damage, counters, evolution and the engaged state. The card is not treated
   * as newly put onto the field. `enteredFieldTurn` is still set to this turn: the card has
   * not remained under the new controller since the turn started (CR 8.4.2.1).
   */
  keepState?: boolean;
}

/** CR 4.2.3.3 — default faceup state per zone. */
const DEFAULT_FACE_UP: Readonly<Record<ZoneName, boolean>> = {
  leader: true,
  deck: false,
  hand: false,
  field: true,
  ex: true,
  cemetery: true,
  banished: true, // CR 4.10.2
  evolveDeck: false,
  evolveZone: true, // CR 4.12.2 public
  resolution: true, // CR 4.11.2 public
};

/** CR 9.1.4.1 / 9.1.4.3 — zones where follower, amulet and spell tokens may exist. */
const TOKEN_ZONES: readonly ZoneName[] = ["ex", "field", "resolution"];

function zoneList(state: GameState, player: PlayerId, zone: ZoneName): CardId[] {
  return zone === "resolution" ? state.resolution : state.players[player].zones[zone];
}

function detach(state: GameState, card: CardInstance): void {
  const list = zoneList(state, card.controller, card.zone);
  const i = list.indexOf(card.id);
  if (i < 0) throw new EngineError(`card ${card.id} is not in its zone ${card.zone}`);
  list.splice(i, 1);
}

function attach(state: GameState, card: CardInstance, position: "top" | "bottom" | undefined): void {
  const list = zoneList(state, card.controller, card.zone);
  if (card.zone === "deck") {
    if (position === undefined) throw new EngineError("moving a card into a deck needs a position");
    if (position === "top") list.unshift(card.id);
    else list.push(card.id);
  } else {
    list.push(card.id);
  }
  state.cards[card.id] = card;
}

function freshInstance(
  state: GameState,
  printing: PrintingId,
  def: DefId,
  owner: PlayerId,
  controller: PlayerId,
  zone: ZoneName,
  opts: { faceUp?: boolean | undefined; engaged?: boolean | undefined },
): CardInstance {
  const seq = nextSeq(state);
  return {
    id: `c${seq}`,
    printing,
    def,
    owner,
    controller,
    zone,
    engaged: opts.engaged ?? false,
    faceUp: opts.faceUp ?? DEFAULT_FACE_UP[zone],
    zoneSeq: seq,
    damage: 0,
    enteredFieldTurn: zone === "field" ? state.turn : null,
    evolvedTurn: null,
    evolvedWith: null,
    superEvolved: false,
    counters: {},
    abilityUses: {},
    playedFrom: null,
    enteredFrom: null,
  };
}

/** CR 13.3.2.2 — a card with Stack is put onto the field with one Stack counter. */
function initFieldCounters(g: G, card: CardInstance): void {
  if (card.zone === "field" && g.scripts[card.def]?.keywords?.includes("stack")) card.counters.stack = 1;
}

/**
 * CR 13.3.2.2 — "When this card would leave the field, if it has any Stack counters on it,
 * remove one instead, and this card remains on the field." Returns true if the move of
 * `card` is replaced.
 */
function stackReplacesLeaving(g: G, card: CardInstance, to: ZoneName): boolean {
  if (card.zone !== "field" || to === "field") return false;
  const n = card.counters.stack ?? 0;
  if (n <= 0 || !characteristics(g, card.id).keywords.includes("stack")) return false;
  card.counters.stack = n - 1;
  g.emit({ type: "countersChanged", card: card.id, counter: "stack", count: n - 1 });
  return true;
}

/**
 * Move cards simultaneously. Each moved card becomes a new card object with a new id
 * (CR 4.1.4). Emits one `cardsMoved` event, so automatic abilities see all moves of the
 * batch together (CR 10.7.4.2). Tokens that land in a zone where they cannot exist are
 * eliminated right after the move (CR 9.1.4.4).
 * Returns the new ids, in spec order, of the cards that actually moved (a move replaced by
 * Stack, CR 13.3.2.2, is left out).
 */
export function moveCards(g: G, allSpecs: readonly MoveSpec[], reason: MoveReason): CardId[] {
  const { state } = g;
  const specs = allSpecs.filter((s) => !stackReplacesLeaving(g, getCard(state, s.card), s.to));
  if (specs.length === 0) return [];
  // Look-back information is captured before anything moves (CR 10.7.4.1).
  const olds = specs.map((s) => getCard(state, s.card));
  const befores = olds.map((c) => {
    const onField = c.zone === "field" ? characteristics(g, c.id) : null;
    const before: NonNullable<CardMove["before"]> = {
      abilityDef: onField ? onField.def.id : c.def,
      controller: c.controller,
      counters: { ...c.counters },
      // Every name it had there, e.g. "this follower's name is also Ghost" (CR 10.7.4.1.2).
      names: onField ? [...onField.names] : [g.db.get(c.def).name],
    };
    if (onField && onField.abilitiesLostAt !== null) before.abilitiesLost = true; // BP05-061
    return before;
  });

  const moves: CardMove[] = [];
  const newIds: CardId[] = [];
  const eliminated: CardId[] = [];
  specs.forEach((spec, i) => {
    const old = olds[i]!;
    detach(state, old);
    delete state.cards[old.id];
    const toPlayer = spec.player ?? old.owner;
    const card = freshInstance(state, old.printing, old.def, old.owner, toPlayer, spec.to, spec);
    initFieldCounters(g, card);
    const exToField = old.zone === "ex" && spec.to === "field"; // CR 4.8.3.3, BP03-102 ruling
    if ((spec.keepCounters || exToField) && Object.keys(old.counters).length > 0) {
      card.counters = { ...card.counters, ...old.counters };
    }
    if (spec.keepState) {
      // CR 5.22 — a stolen card is not newly put onto the field and keeps its state.
      card.damage = old.damage;
      card.counters = { ...old.counters };
      card.evolvedWith = old.evolvedWith;
      card.evolvedTurn = old.evolvedTurn;
      card.superEvolved = old.superEvolved;
      card.abilityUses = { ...old.abilityUses };
      card.engaged = old.engaged;
      // CR 8.4.2.1 — it has not remained under the new controller since the turn started.
      card.enteredFieldTurn = state.turn;
      card.enteredFrom = null;
    } else if (spec.to === "resolution" && (spec.reason ?? reason) === "play") {
      card.playedFrom = old.zone; // CR 5.5.3 the zone the card is played from
    } else if (spec.to === "field") {
      card.enteredFrom = old.zone === "resolution" ? (old.playedFrom ?? old.zone) : old.zone;
    }
    attach(state, card, spec.position);

    if (spec.keepEffects || exToField) {
      for (const e of state.effects) if (e.target === old.id) e.target = card.id;
    } else if (state.effects.some((e) => e.target === old.id)) {
      state.effects = state.effects.filter((e) => e.target !== old.id);
    }

    moves.push({
      card: old.id,
      newCard: card.id,
      def: old.def,
      printing: old.printing,
      owner: old.owner,
      from: { player: old.controller, zone: old.zone, faceUp: old.faceUp },
      to: { player: toPlayer, zone: spec.to, faceUp: card.faceUp },
      reason: spec.reason ?? reason,
      before: befores[i]!,
    });
    newIds.push(card.id);
    if (g.db.get(old.def).token && !TOKEN_ZONES.includes(spec.to)) eliminated.push(card.id);
    // "This turn" counts for card conditions (turn-counts.ts).
    const why = spec.reason ?? reason;
    if (why === "discard") thisTurn(state, old.controller).discarded += 1; // CR 5.12
    if (old.zone === "field" && spec.to === "hand") thisTurn(state, old.controller).returnedToHand += 1;
    if (why === "destroy" && old.zone === "field" && g.db.get(befores[i]!.abilityDef).type === "follower") {
      thisTurn(state, old.controller).followersDestroyed += 1; // CR 5.6
    }
  });

  g.emit({ type: "cardsMoved", moves });
  if (eliminated.length > 0) eliminateTokens(g, eliminated);
  return newIds;
}

/** CR 9.1.3 — remove tokens from the game. */
export function eliminateTokens(g: G, ids: readonly CardId[]): void {
  for (const id of ids) {
    const c = getCard(g.state, id);
    detach(g.state, c);
    delete g.state.cards[id];
    if (g.state.effects.some((e) => e.target === id)) {
      g.state.effects = g.state.effects.filter((e) => e.target !== id);
    }
  }
  g.emit({ type: "tokensEliminated", cards: [...ids] });
}

export interface CreateSpec {
  def: DefId;
  player: PlayerId;
  to: "field" | "ex";
  engaged?: boolean;
}

/**
 * CR 9.1.2 — create tokens directly in a zone (owner and controller: that zone's player,
 * 9.1.2.1). Counts as being put into that zone (9.1.2.2). No limit checks here.
 */
export function createCards(g: G, specs: readonly CreateSpec[], reason: MoveReason): CardId[] {
  const moves: CardMove[] = [];
  const ids = specs.map((spec) => {
    const def = g.db.get(spec.def);
    const card = freshInstance(g.state, def.printings[0]!, def.id, spec.player, spec.player, spec.to, spec);
    initFieldCounters(g, card);
    attach(g.state, card, undefined);
    moves.push({
      card: null,
      newCard: card.id,
      def: def.id,
      printing: card.printing,
      owner: spec.player,
      from: null,
      to: { player: spec.player, zone: spec.to, faceUp: card.faceUp },
      reason,
      before: null,
    });
    return card.id;
  });
  g.emit({ type: "cardsMoved", moves });
  return ids;
}

/**
 * Put a card into a zone while building a game state (CR 6.2.1.1–6.2.1.5, or a test
 * scenario). Not a game action: no events, no triggers. Decks are filled top to bottom.
 */
export function placeInitialCard(
  state: GameState,
  db: CardDatabase,
  printing: PrintingId,
  owner: PlayerId,
  zone: PlayerZone,
  opts: { engaged?: boolean; faceUp?: boolean } = {},
): CardId {
  const def = db.ofPrinting(printing);
  const card = freshInstance(state, printing, def.id, owner, owner, zone, opts);
  attach(state, card, "bottom");
  return card.id;
}
