// ECP02-025 Dancing in the Rain — Swordcraft amulet, 1. デレマス・クール.
// {[fanfare]} Search your deck for a follower with "Nao Kamiya" in its name, reveal it, add it to your hand, then shuffle.
// {[act]} {[engage]}, bury this: Select a Cool follower on your field and give it Rush and Assail.
import { activated, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { cool, followerNamed } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => followerNamed("Nao Kamiya")(fx.game, id));
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: cool })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveKeyword(target, "rush");
          yield* fx.giveKeyword(target, "assail");
        },
      },
    ),
  ],
});
