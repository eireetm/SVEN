// BP12-032 Wolf Fang Swordsman — Swordcraft follower, 2, 2/3. 兵士・獣.
// Bane.
// {[act]} {[cost04]}: Give this follower {[attack]}+2/{[defense]}+2 and Storm.
import { activated, defineCard } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    activated(
      { playPoints: 4 },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.giveStats(fx.self, 2, 2);
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
