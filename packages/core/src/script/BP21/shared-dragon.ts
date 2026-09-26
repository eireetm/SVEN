// Shared pieces of BP21 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import { passionInEx } from "./shared";

/**
 * "If it has at least 10, give this {[defense]}+6." (BP21-060, 061, 063, 065, 069): "it" is a card in your EX area with
 * passion counters (「10個以上なら」), checked as the ability resolves.
 */
export function* tenPassionDefense(fx: EffectContext): Proc<void> {
  if (passionInEx(fx.game, fx.controller) >= 10 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 0, 6);
}
