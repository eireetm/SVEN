import type { CardDatabase } from "../../data/database";
import type { GameState } from "../../model/state";
import type { GameEvent } from "../../events/types";
import type { ScriptRegistry } from "../../script/types";

/**
 * The runtime context threaded through every engine procedure.
 * `state` is mutated in place by the running procedures; the session owns cloning.
 */
export interface G {
  readonly state: GameState;
  readonly db: CardDatabase;
  readonly scripts: ScriptRegistry;
  /** Record an event and detect automatic-ability triggers it satisfies (CR 10.7.2). */
  emit(event: GameEvent): void;
}
