// CSD02a-007 Akiha Ikebukuro — Runecraft follower, 3, 3/3. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select another Cute follower on your field and give it {[defense]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { cute } from "../CP02/shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [anotherYourFollower({ filter: cute })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 0, 1);
      },
    }),
  ],
});
