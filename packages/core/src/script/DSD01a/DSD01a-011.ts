// DSD01a-011 マナリアの召喚士・ベリル (Evolved) — 3/3.
// Japanese-only data (no English text); implemented from the Japanese:
// 【進化時】自分のデッキの上5枚を見る。その中から、元のコスト2以下の学院・カード2枚までEXエリアに置いてよい。残りを好きな順にデッキの下に置く。
// このターン、それをプレイする際、コストを-2する。
// (On Evolve - Look at the top 5 cards of your deck. You may put up to 2 Academic cards that cost 2 or less from among them into your
// EX area. Put the rest on the bottom of your deck in any order. They cost 2 less to play this turn. 元のコスト.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost } from "../targets";
import { academic } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const moved = yield* lookAtTopCards(fx, 5, { filter: and(academic, costAtMost(2)), to: "ex", max: 2 });
        for (const id of moved) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
