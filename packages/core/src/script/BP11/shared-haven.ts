// BP11 Havencraft abilities shared by a card and its evolved card (not a card).
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import { wasteland } from "./shared";

/**
 * BP11-087 / 088 "Select up to 2 enemy followers on the field and deal them 3 damage. If there's a
 * Wasteland card in your EX area, deal 2 damage to each enemy leader." (Selecting none still deals the
 * leader damage — ruling.)
 */
export function* anveltBarrage(fx: EffectContext): Proc<void> {
  yield* fx.dealDamageEach(fx.targets[0] ?? [], 3);
  if (fx.game.cards(fx.controller, "ex").some((id) => wasteland(fx.game, id))) {
    yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
  }
}
