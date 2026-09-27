import type { DefId, PrintingId, CardType, Universe } from "../model/card";
import type { Decision } from "../model/decision";
import type { CardId, PlayerId } from "../model/ids";
import type { Keyword } from "../model/keyword";
import type { AttackState, GameResult, Phase, PlayerZone } from "../model/state";
import type { Env } from "../engine/state/access";
import { characteristics, isBoxed } from "../engine/state/characteristics";
import { cardVisibleTo } from "./visibility";

/** A card whose information the viewer may see. */
export interface CardView {
  id: CardId;
  hidden: false;
  printing: PrintingId;
  def: DefId;
  name: string;
  type: CardType;
  owner: PlayerId;
  controller: PlayerId;
  engaged: boolean;
  faceUp: boolean;
  /** CR 2.14.3 — a double-faced card showing its back face (its information is the back face's). */
  backFace: boolean;
  cost: number | null;
  attack: number | null;
  defense: number | null;
  damage: number;
  keywords: readonly Keyword[];
  /** Linked evolve-zone card, if evolved (CR 5.16.1). */
  evolvedWith: CardId | null;
  superEvolved: boolean;
  /** CR 5.31 — it is Boxed (lost its abilities, doesn't refresh in its controller's start phase). */
  boxed: boolean;
  /** CR 15.1 */
  counters: Readonly<Record<string, number>>;
  /** A race-zone, drive-zone or equipment-zone card: the card on the field it is linked to (CR 14.2.1.1, 14.4.9.2, 14.5.2.2). */
  linkedTo: CardId | null;
}

/** A card the viewer may not look at (only that it exists). */
export interface HiddenCardView {
  id: CardId;
  hidden: true;
}

export interface PlayerSideView {
  id: PlayerId;
  leader: CardView | null;
  leaderDefense: number;
  playPoints: number;
  maxPlayPoints: number;
  evolutionPoints: number;
  superEvolutionPoints: number;
  turnsPassed: number;
  /** CR 4.1.2.1 — card counts are always public. Deck contents / order never are. */
  deckCount: number;
  hand: (CardView | HiddenCardView)[];
  field: CardView[];
  ex: CardView[];
  cemetery: CardView[];
  banished: (CardView | HiddenCardView)[];
  evolveDeck: (CardView | HiddenCardView)[];
  evolveZone: CardView[];
  /** CR 4.13–4.16 — the collaboration zones (public). */
  raceZone: CardView[];
  driveZone: CardView[];
  triggerZone: CardView[];
  equipmentZone: CardView[];
  /** CR 6.1.1.5 — the universe the deck is based on, or null for a class-based deck (public). */
  universe: Universe | null;
}

export interface PlayerView {
  viewer: PlayerId;
  turn: number;
  phase: Phase;
  activePlayer: PlayerId;
  firstPlayer: PlayerId | null;
  result: GameResult | null;
  attack: AttackState | null;
  players: [PlayerSideView, PlayerSideView];
  resolution: CardView[];
  /** The pending decision if it is the viewer's; otherwise null. */
  decision: Decision | null;
  /** Who the game is waiting for, if anyone. */
  waitingFor: PlayerId | null;
}

function cardView(env: Env, id: CardId): CardView {
  const c = env.state.cards[id]!;
  const ch = characteristics(env, id);
  return {
    id,
    hidden: false,
    printing: c.printing,
    def: c.def,
    name: ch.name,
    type: ch.type,
    owner: c.owner,
    controller: c.controller,
    engaged: c.engaged,
    faceUp: c.faceUp,
    backFace: c.backFace,
    cost: ch.cost,
    attack: ch.attack,
    defense: ch.defense,
    damage: c.damage,
    keywords: ch.keywords,
    evolvedWith: c.evolvedWith,
    superEvolved: c.superEvolved,
    boxed: isBoxed(env.state, id),
    counters: { ...c.counters },
    linkedTo: c.linkedTo ?? null,
  };
}

/** Visible if the zone allows it (CR 4.1.2) or it is currently revealed (CR 5.21). */
function viewFor(env: Env, viewer: PlayerId, id: CardId): CardView | HiddenCardView {
  const visible = cardVisibleTo(env.state.cards[id]!, viewer) || env.state.revealed.includes(id);
  return visible ? cardView(env, id) : { id, hidden: true };
}

function sideView(env: Env, viewer: PlayerId, p: PlayerId): PlayerSideView {
  const ps = env.state.players[p];
  const all = (zone: PlayerZone) => ps.zones[zone].map((id) => cardView(env, id));
  const some = (zone: PlayerZone) => ps.zones[zone].map((id) => viewFor(env, viewer, id));
  const leaderId = ps.zones.leader[0];
  return {
    id: p,
    leader: leaderId === undefined ? null : cardView(env, leaderId),
    leaderDefense: ps.leaderDefense,
    playPoints: ps.playPoints,
    maxPlayPoints: ps.maxPlayPoints,
    evolutionPoints: ps.evolutionPoints,
    superEvolutionPoints: ps.superEvolutionPoints,
    turnsPassed: ps.turnsPassed,
    deckCount: ps.zones.deck.length,
    hand: some("hand"),
    field: all("field"),
    ex: all("ex"),
    cemetery: all("cemetery"),
    banished: some("banished"),
    evolveDeck: some("evolveDeck"),
    evolveZone: all("evolveZone"),
    raceZone: all("raceZone"),
    driveZone: all("driveZone"),
    triggerZone: all("triggerZone"),
    equipmentZone: all("equipmentZone"),
    universe: ps.universe,
  };
}

/** Build the information available to `viewer` (CR 4.1.2). */
export function playerView(env: Env, viewer: PlayerId, decision: Decision | null): PlayerView {
  const s = env.state;
  return {
    viewer,
    turn: s.turn,
    phase: s.phase,
    activePlayer: s.activePlayer,
    firstPlayer: s.firstPlayer,
    result: s.result,
    attack: s.attack,
    players: [sideView(env, viewer, 0), sideView(env, viewer, 1)],
    resolution: s.resolution.map((id) => cardView(env, id)),
    decision: decision && decision.player === viewer ? decision : null,
    waitingFor: decision ? decision.player : null,
  };
}
