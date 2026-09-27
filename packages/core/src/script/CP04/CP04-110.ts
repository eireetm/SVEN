// CP04-110 Omniscient Kaiser (Evolved) — Neutral, 7/7. プリコネ・七冠.
// {[ub]} On Evolve - Deal 7 damage to each enemy follower on the field.
import { defineCard, onEvolve, ub } from "../helpers";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 7);
        },
      }),
    ),
  ],
});
