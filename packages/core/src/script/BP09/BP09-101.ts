// BP09-101 Deathscythe Nun — Havencraft follower, 2, 2/3. 狂信.
// Bane.
// {[fanfare]} Select another {[havencraft]} follower on your field and give it Bane.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower, isClass } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: isClass("Havencraft") })],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "bane");
      },
    }),
  ],
});
