// BP03-077 Demonium, Punk Devil — Abysscraft follower, 2, 2/3. 魔界.
// Ward.
// Activate, give your leader -2 defense: Give this follower Bane. Once per turn.
// {[lastwords]} Give your leader +2 defense.
import { activated, defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    activated(
      { leaderDefense: 2 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "bane");
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
