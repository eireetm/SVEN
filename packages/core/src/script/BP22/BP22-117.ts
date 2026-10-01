// BP22-117 〔全力疾走〕オグリキャップ — Dragoncraft follower (Umamusume universe), 9, 2/2. ウマ娘.
// これをプレイする際、コストを-Xする。Xは「自分の場のウマ娘・カードの枚数の2倍」である。
// 進化コスト1：これは進化する。
// 食事コスト1：これは出走する。
// 【疾走】
// (This costs X less to play, X = twice the number of Umamusume cards on your field. Evolve (1). Serve {[cost01]}: Race this
// follower (CR 14.2.2). Storm.)
import { defineCard, evolveAbility, serveAbility } from "../helpers";
import { umamusume } from "./shared";

export default defineCard({
  keywords: ["storm"],
  playCost: (g, _self, player) => -2 * g.cards(player, "field").filter((id) => umamusume(g, id)).length,
  abilities: [evolveAbility(1), serveAbility(1, 1)],
});
