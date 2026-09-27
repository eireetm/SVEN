// CSD02b-009 Chizuru Matsuo — Swordcraft follower, 2, 2/3. デレマス・クール.
// {[fanfare]} Select another Cool follower on your field and give it {[attack]}+1.
// {[lastwords]} Select a Cool follower on your field and give it {[attack]}+1.
import { defineCard, fanfare, lastWords } from "../helpers";
import { anotherYourFollower, yourFollower } from "../targets";
import { cool } from "../CP02/shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: cool })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
    lastWords({
      targets: [yourFollower({ filter: cool })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
  ],
});
