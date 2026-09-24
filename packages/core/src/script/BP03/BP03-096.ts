// BP03-096 Alice's Adventure — Havencraft amulet, 2. 童話.
// {[fanfare]} Search for a Fable card.
// {[act]} {[cost01]}, {[engage]}, bury this: Give a Fable follower on your field Rush and Assail.
import { activated, defineCard, fanfare } from "../helpers";
import { hasTrait, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => hasTrait("童話")(fx.game, id));
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: hasTrait("童話") })],
        *resolve(fx) {
          const id = fx.targets[0]![0]!;
          yield* fx.giveKeyword(id, "rush");
          yield* fx.giveKeyword(id, "assail");
        },
      },
    ),
  ],
});
