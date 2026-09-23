// BP01-155 Urd — Neutral follower, 4, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and put it into its owner's EX area.
// (Evolved followers put into the EX area are removed from the game: the evolved card goes to
// the evolve deck faceup, CR 11.6.1. Damage, counters and given abilities are lost; tokens stay
// in the EX area — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
  ],
});
