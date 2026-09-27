// SD02-005 Moonlight Assassin — Swordcraft follower, 2, 3/2. 暗殺者.
// {[act]} {[cost01]}: Give this follower Bane. (No duration: it keeps Bane while it is on the field.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1 },
      {
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "bane");
        },
      },
    ),
  ],
});
