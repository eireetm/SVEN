// CP04-080 Rei — Abysscraft follower, 1, 1/2. プリコネ・トゥインクルウィッシュ.
// {[ub]} Strike - Give this {[attack]}+1. If {[ub]} abilities you control have executed at least 2 other times this turn, give
// {[attack]}+2 instead.
// Rush.
import { defineCard, strike, ub } from "../helpers";
import { otherUnionBursts } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    ub(
      strike({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.giveStats(fx.self, otherUnionBursts(fx) >= 2 ? 2 : 1, 0);
        },
      }),
    ),
  ],
});
