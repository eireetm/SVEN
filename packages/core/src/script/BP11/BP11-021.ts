// BP11-021 Reinhardt, the Deathless — Swordcraft follower, 3, 3/4. 指揮官.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} If there are at least 3 faceup evolved followers in your evolve deck, evolve this
// follower. (Not this turn's evolve ability — ruling, CR 8.3.2.1; advanced followers and Drive Points
// don't count — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isEvolvedFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      condition: (g, p) => g.faceUpEvolveDeck(p).filter((id) => isEvolvedFollower(g, id)).length >= 3,
      *resolve(fx) {
        yield* fx.evolve(fx.self);
      },
    }),
  ],
});
