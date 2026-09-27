// CP04-010 Rino (Evolved) — Forestcraft, 2/2. プリコネ・ラビリンス.
// {[ub]} On Evolve - Deal 1 damage to each enemy follower on the field.
import { defineCard, onEvolve, ub } from "../helpers";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
        },
      }),
    ),
  ],
});
