// Public API of @sve/core — a headless, deterministic Shadowverse: Evolve rules engine.

export type { CardDefinition, CardClass, CardType, DefId, PrintingId, LocalizedText } from "./model/card";
export { CARD_CLASSES } from "./model/card";
export type { PlayerId, CardId } from "./model/ids";
export { opponentOf, PLAYERS } from "./model/ids";
export type { Keyword } from "./model/keyword";
export { IMPLEMENTED_KEYWORDS } from "./model/keyword";
export type { GameConfig, RuleParameters, AutoResolvable } from "./model/config";
export { DEFAULT_CONFIG, DEFAULT_RULES, ALL_AUTO_RESOLVABLE } from "./model/config";
export type {
  GameState,
  PlayerState,
  CardInstance,
  PlayerZone,
  ZoneName,
  Phase,
  GameResult,
  LossReason,
  PersistentEffect,
  PendingAbility,
  AttackState,
} from "./model/state";
export { PLAYER_ZONES } from "./model/state";
export type {
  Decision,
  Answer,
  Input,
  MainAction,
  QuickAction,
  SelectReason,
  ConfirmReason,
} from "./model/decision";

export type { GameEvent, CardMove, MoveReason, ZoneRef } from "./events/types";
export { redactEvent } from "./events/redact";

export { CardDatabase, DEFAULT_LEADER } from "./data/database";
export { CardDataError, normalizePrinting, groupPrintings } from "./data/normalize";
export type { RawCardJson } from "./data/raw";
export { readCardSetFile, type CardSetFile } from "./data/set-file";

export { Engine, createEngine, resolveConfig, type EngineOptions, type GameSetup, type GameConfigInput } from "./engine/engine";
export { GameSession, type GameSnapshot, type SessionOptions } from "./engine/session";
export type { DeckList, ImplementationStatus } from "./engine/deck";
export { EngineError, IllegalInputError, DeckError } from "./engine/errors";
export type { GameReader } from "./engine/query";
export type { Characteristics } from "./engine/state/characteristics";
export type { EffectContext } from "./engine/effects/context";
export type { Proc } from "./engine/runtime/proc";
export { forcedAnswer } from "./engine/runtime/decide";

export type { CardScript, ScriptRegistry, AbilityDef, ActivatedAbility, AutomaticAbility, SpellAbility, TargetSpec, CostSpec, TriggerSubject } from "./script/types";
export * as script from "./script/helpers";

export type { PlayerView, PlayerSideView, CardView, HiddenCardView } from "./view/player-view";
