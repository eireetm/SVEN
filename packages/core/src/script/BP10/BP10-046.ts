// BP10-046 Gambit — Runecraft spell, 2. チェス.
// Summon a Magical Pawn token. Give it {[attack]}+1 and Rush. If there are at least 5 Chess cards in
// your cemetery, search your deck for a Chess follower that costs 4 or less, summon it, then shuffle.
// (元のコスト.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";
import { inCemetery } from "./shared";

const chess = hasTrait("チェス");
const cheapChessFollower = and(isFollower, chess, costAtMost(4));

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        for (const pawn of yield* fx.summon(["Magical Pawn"])) {
          yield* fx.giveStats(pawn, 1, 0);
          yield* fx.giveKeyword(pawn, "rush");
        }
        if (inCemetery(fx.game, fx.controller, chess) >= 5) yield* fx.search((id) => cheapChessFollower(fx.game, id), { to: "field" });
      },
    }),
  ],
});
