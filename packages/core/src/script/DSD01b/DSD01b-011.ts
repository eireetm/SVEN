// DSD01b-011 片倉小十郎 (Evolved) — 3/3.
// Japanese-only data (no English text); implemented from the Japanese:
// 【進化時】自分のデッキの上4枚を見る。その中から、武闘竜人・フォロワー1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く。
// (On Evolve - Look at the top 4 cards of your deck. You may reveal a Draconic Duelist follower from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, isFollower } from "../targets";
import { draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: and(isFollower, draconicDuelist), to: "hand" });
      },
    }),
  ],
});
