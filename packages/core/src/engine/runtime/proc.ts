import type { Answer, Decision } from "../../model/decision";

/**
 * Engine procedures are generators ("Procs"). A Proc runs synchronously until it needs a
 * player decision, yields it, and receives the answer as the value of the `yield`.
 *
 *  - `decision`: pause and ask a player.
 *  - `anchor`:   the flow reached a resumable position (see GameState.anchor); the session
 *                takes a checkpoint here. Nothing is sent back.
 *
 * Because every Proc is deterministic given (state, answers), a paused game can always be
 * rebuilt by replaying the answers from the last checkpoint — generators themselves never
 * need to be serialized.
 */
export type Yielded = { kind: "decision"; decision: Decision } | { kind: "anchor" };

export type Proc<R = void> = Generator<Yielded, R, Answer | undefined>;
