// BP05-032 Gravikinetic Warrior — Swordcraft follower, 4, 4/4. 兵士・超克.
// {[fanfare]} Select a token follower on your field and give it {[attack]}+2/{[defense]}+2.
import { defineCard, fanfare } from "../helpers";
import { isToken, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: isToken })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
      },
    }),
  ],
});
