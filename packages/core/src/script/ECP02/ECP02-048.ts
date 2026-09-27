// ECP02-048 Syoko Hoshi [individuals] — Abysscraft follower, 2, 3/2. デレマス・パッション.
// {[fanfare]} Bury the top 2 cards of your deck.
// {[act]} {[cost01]}, Lesson (2), {[engage]}: Select an iM@S CG follower in your cemetery that costs 2 or less and put it into your
// EX area. It costs 2 less to play this turn. Activate only once per turn. (元のコスト. The Chinese text says Lesson (1).)
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { followerThat, imas, intoExCheaper } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, custom: lesson(2) },
      {
        oncePerTurn: true,
        targets: [inYourZone("cemetery", { filter: (g, id) => followerThat(imas)(g, id) && costAtMost(2)(g, id) })],
        *resolve(fx) {
          yield* intoExCheaper(fx, fx.targets[0]!, 2);
        },
      },
    ),
  ],
});
