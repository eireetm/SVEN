// Shared pieces of BP17 Swordcraft card scripts (not a card: the file name has no set prefix).
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import { KNIGHT, SHIELD_GUARDIAN, STEELCLAD } from "./shared";

/** "Summon a Steelclad Knight, Shield Guardian, or Knight token" (BP17-019, 023). */
export function* summonOneOfficerToken(fx: EffectContext): Proc<void> {
  const [pick] = yield* fx.choose([STEELCLAD, SHIELD_GUARDIAN, KNIGHT].map((name) => ({ id: name, label: name })));
  if (pick !== undefined) yield* fx.summon([pick]);
}
