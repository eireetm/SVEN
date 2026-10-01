// BP22-005 フラワーフォックス — Forestcraft follower, 1, 1/1. 植物族・獣.
// これをプレイする際、自分の場に『ブリリアントフェアリー』がいるなら、コストを-1する。
// 進化コスト1：これは進化する。
// (This costs 1 less to play if there is a ブリリアントフェアリー (BP22-001) on your field. Evolve (1).)
import { defineCard, evolveAbility } from "../helpers";
import { named } from "../targets";
import { BRILLIANT_FAIRY, onYourField } from "./shared";

export default defineCard({
  playCost: (g, _self, player) => (onYourField(g, player, named(BRILLIANT_FAIRY)) ? -1 : 0),
  abilities: [evolveAbility(1)],
});
