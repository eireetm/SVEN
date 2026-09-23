import type { CardDatabase } from "../../data/database";
import type { CardId, PlayerId } from "../../model/ids";
import type { CardInstance, GameState, PlayerState, PlayerZone } from "../../model/state";
import type { ScriptRegistry } from "../../script/types";
import { EngineError } from "../errors";

/** The read-only part of the runtime context (G satisfies it). */
export interface Env {
  readonly state: GameState;
  readonly db: CardDatabase;
  readonly scripts: ScriptRegistry;
}

export function findCard(state: GameState, id: CardId): CardInstance | undefined {
  return state.cards[id];
}

export function getCard(state: GameState, id: CardId): CardInstance {
  const c = state.cards[id];
  if (!c) throw new EngineError(`card ${id} does not exist`);
  return c;
}

export function getPlayer(state: GameState, p: PlayerId): PlayerState {
  return state.players[p];
}

export function zoneOf(state: GameState, p: PlayerId, zone: PlayerZone): CardId[] {
  return state.players[p].zones[zone];
}

/** CR 4.3 — the leader card of a player. */
export function leaderOf(state: GameState, p: PlayerId): CardId {
  const id = state.players[p].zones.leader[0];
  if (id === undefined) throw new EngineError(`player ${p} has no leader`);
  return id;
}

export function isOnField(state: GameState, id: CardId): boolean {
  const c = state.cards[id];
  return c !== undefined && c.zone === "field";
}

export function isLeader(state: GameState, id: CardId): boolean {
  const c = state.cards[id];
  return c !== undefined && c.zone === "leader";
}

/** Next value of the monotonic counter used for ids and timestamps. */
export function nextSeq(state: GameState): number {
  state.seq += 1;
  return state.seq;
}
