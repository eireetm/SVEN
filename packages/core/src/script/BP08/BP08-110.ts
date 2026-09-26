// BP08-110 Reina, Evolution's Herald — Neutral follower, 5, 4/4. 光輝.
// Evolve (2). Fanfare: deal damage to an enemy follower equal to the number of faceup evolved
// followers in your evolve deck; evolved amulets do not count (rulings; CR 4.6.3, 5.14).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, isEvolvedFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const x = fx.game.faceUpEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, x);
      },
    }),
  ],
});
