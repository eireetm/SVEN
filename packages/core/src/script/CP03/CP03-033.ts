// CP03-033 Toypugal — Swordcraft follower, 2, 3/2. ヴァンガード・ロイヤルパラディン.
// {[fanfare]} Select a Vanguard follower that costs 4 or more on your field and give it {[attack]}+2/{[defense]}+2, Rush and
// Assail. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { costAtLeast, yourFollower } from "../targets";
import { vanguard } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: (g, id) => vanguard(g, id) && costAtLeast(4)(g, id) })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 2, 2);
        yield* fx.giveKeyword(target, "rush");
        yield* fx.giveKeyword(target, "assail");
      },
    }),
  ],
});
