// Shared pieces of BP16 Neutral card scripts (not a card: the file name has no set prefix).
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";

/** BP16-118 / 119 "Deal 1 damage to each enemy leader and each enemy follower on the field." */
export function* heavensEnvoyRain(fx: EffectContext): Proc<void> {
  const opp = fx.game.opponent(fx.controller);
  yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 1);
}
