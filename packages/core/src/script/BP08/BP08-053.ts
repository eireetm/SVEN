// BP08-053 Azi Dahaka - Dragoncraft follower, 6, 5/6. Dragon.
// Evolve (2): Evolve this follower.
// Fanfare - Turn 3 facedown evolved followers in your evolve deck faceup: select an enemy follower
// and destroy it. The three cards are chosen as the cost (CR 4.6.3, 10.4.2, 10.4.3).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: {
        canPay: (g, c) => g.faceDownEvolveDeck(c).filter((id) => isFollower(g, id)).length >= 3,
        *pay(fx) {
          const candidates = fx.game.faceDownEvolveDeck(fx.controller).filter((id) => isFollower(fx.game, id));
          yield* fx.turnFaceup(yield* fx.chooseCards(candidates, 3, 3));
        },
      },
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
