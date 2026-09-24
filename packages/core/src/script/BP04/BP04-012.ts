// BP04-012 Dolorblade Demon — Forestcraft follower, 4, 4/4. 狩人.
// {[fanfare]}/{[lastwords]} Deal 1 damage to each enemy leader and enemy follower on the field.
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, lastWords } from "../helpers";

function* pingAll(fx: EffectContext) {
  const opp = fx.game.opponent(fx.controller);
  yield* fx.dealDamages([
    { target: fx.game.leader(opp), amount: 1 },
    ...fx.game.followers(opp).map((target) => ({ target, amount: 1 })),
  ]);
}

export default defineCard({
  abilities: [fanfare({ resolve: pingAll }), lastWords({ resolve: pingAll })],
});
