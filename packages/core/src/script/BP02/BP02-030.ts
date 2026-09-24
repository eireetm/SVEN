// BP02-030 Samurai — Swordcraft follower, 2, 3/2.
// {[act]}{[cost03]}: Give this follower Storm and Bane. (Kept until it leaves the field — ruling.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 3 },
      {
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "storm");
          yield* fx.giveKeyword(fx.self, "bane");
        },
      },
    ),
  ],
});
