// BP22-010 清き泉のエルフプリンセスメイジ (evolved) — Forestcraft, 3/3. エルフ族・プリンセス.
// 【進化時】自分のデッキの上4枚を見る。その中から、妖精・カードかエルフ族・カード1枚を公開して手札に加えてよい。残りを好きな順にデッキの
// 下に置く。
// (On Evolve - Look at the top 4 cards of your deck; you may reveal a Pixie or Elf card among them and add it to your hand; put
// the rest on the bottom in any order.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { elf, pixie } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => pixie(g, id) || elf(g, id), to: "hand" });
      },
    }),
  ],
});
