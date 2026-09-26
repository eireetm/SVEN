// BP18-038 Luminous Standard — Swordcraft amulet, 3. 指揮官・ルミナス.
// {[fanfare]} Search your deck for a Luminous Commander, Luminous Magus, and Luminous Lancetrooper, reveal them, add them to
// your hand, then shuffle. (Any of them may be left out — ruling.)
// Activate {[engage]} this, bury this: Select a Commander follower on your field and give it {[attack]}+1/{[defense]}+1.
import { activated, defineCard, fanfare } from "../helpers";
import { named, yourFollower } from "../targets";
import { commander } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.searchEach(["Luminous Commander", "Luminous Magus", "Luminous Lancetrooper"].map((name) => (id: string) => named(name)(g, id)));
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: commander })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
    ),
  ],
});
