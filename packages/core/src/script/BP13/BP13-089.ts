// BP13-089 Jeanne, Despair's Maiden (Evolved) — Havencraft follower, 6/5. 狂信・キラー.
// On Evolve - Deal 3 damage to each enemy leader and enemy follower on the field. Give your leader
// {[defense]}+3.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 3);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
