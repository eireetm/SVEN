// BP16-089 Aryll, Moonstruck Vampire — Abysscraft follower, 4, 3/3. 吸血鬼.
// {[fanfare]} Summon 2 Forest Bat tokens.
// Activate {[engage]} this: Select a Vampire token follower on your field and give it {[attack]}+1/{[defense]}+1, Rush,
// and Drain.
import { activated, defineCard, fanfare } from "../helpers";
import { isToken, yourFollower } from "../targets";
import { FOREST_BAT, vampire } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([FOREST_BAT, FOREST_BAT]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourFollower({ filter: (g, id) => isToken(g, id) && vampire(g, id) })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveStats(target, 1, 1);
          yield* fx.giveKeyword(target, "rush");
          yield* fx.giveKeyword(target, "drain");
        },
      },
    ),
  ],
});
