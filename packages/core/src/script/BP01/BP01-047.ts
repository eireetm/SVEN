// BP01-047 Navy Lieutenant — Swordcraft follower, 2, 2/3.
// {[fanfare]} Select another follower on your field and give it Assail.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "assail");
      },
    }),
  ],
});
