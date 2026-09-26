// BP19-094 Uneriel, Winged Enforcer (Evolved) — 6/6.
// On Evolve - Destroy each amulet on your field. Deal each enemy leader and enemy follower on the field X damage. Give your
// leader {[defense]}+X. Recover X play points. X equals the number of amulets destroyed this way.
// (Amulets that can't be destroyed by abilities are not counted — ruling; with X = 0 nothing happens, CR 1.3.2.2.)
import { defineCard, onEvolve } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const amulets = fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id));
        const x = (yield* fx.destroy(amulets)).length;
        if (x === 0) return;
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], x);
        yield* fx.giveLeaderDefense(fx.controller, x);
        yield* fx.recoverPlayPoints(x);
      },
    }),
  ],
});
