// BP08-053 Azi Dahaka — Dragoncraft follower, 6, 5/6. 竜族.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Turn 3 facedown evolved followers in your evolve deck faceup: Select an enemy follower
// on the field and destroy it. (The three cards are chosen as the cost, CR 4.6.3, 10.4.2; without
// a target the cost can't be paid — ruling. Not advanced followers, CR 9.2.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, isEvolvedFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: {
        canPay: (g, c) => g.faceDownEvolveDeck(c).filter((id) => isEvolvedFollower(g, id)).length >= 3,
        *pay(fx) {
          const candidates = fx.game.faceDownEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(fx.game, id));
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
