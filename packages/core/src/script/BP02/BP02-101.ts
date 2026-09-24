// BP02-101 Sky Sprite — Havencraft follower, 3, 3/3.
// {[fanfare]} Select another follower on your field that was put onto the field this turn and give
// it {[attack]}+2/{[defense]}+2.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower, enteredThisTurn } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: enteredThisTurn })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
      },
    }),
  ],
});
