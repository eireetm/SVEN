// BP01-108 Dire Bond — Abysscraft amulet, 1.
// {[fanfare]} Deal 1 damage to your leader. Draw a card.
// {[act]}{[cost02]}, {[engage]}, put this card into its owner's cemetery: Deal 1 damage to your
// leader. Draw a card.
import { activated, defineCard, fanfare } from "../helpers";
import type { EffectContext } from "../../engine/effects/context";

function* bond(fx: EffectContext) {
  yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
  yield* fx.draw(1);
}

export default defineCard({
  abilities: [fanfare({ resolve: bond }), activated({ playPoints: 2, engageSelf: true, burySelf: true }, { resolve: bond })],
});
