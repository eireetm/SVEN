// BP18-017 Rayne, Elf Smith — Forestcraft follower, 2, 3/2. エルフ族.
// {[fanfare]} Select another follower on your field and give it {[attack]}+1, Rush, and for the rest of this turn, "This
// doesn't take damage." ("-2/-2" isn't damage — ruling.)
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 1, 0);
        yield* fx.giveKeyword(target, "rush");
        yield* fx.preventDamage(target, "all", "endOfTurn");
      },
    }),
  ],
});
