import type { PlayerId } from "../../model/ids";
import type { Env } from "./access";

/**
 * Current zone limits. The rules say these limits "may be referenced during the game"
 * (CR 4.4.4, 4.7.3, 4.8.3), i.e. effects may change them later; every rule reads the limit
 * through these functions so such effects only need to be added here.
 */

/** CR 4.4.4 */
export function fieldLimit(env: Env, _player: PlayerId): number {
  return env.state.config.rules.fieldLimit;
}

/** CR 4.8.3 */
export function exAreaLimit(env: Env, _player: PlayerId): number {
  return env.state.config.rules.exAreaLimit;
}

/** CR 4.7.3 */
export function handLimit(env: Env, _player: PlayerId): number {
  return env.state.config.rules.handLimit;
}
