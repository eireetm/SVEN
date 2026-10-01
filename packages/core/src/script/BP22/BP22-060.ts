// BP22-060 黒白の乱舞・ノール＆ブラン — Dragoncraft follower, 1, 2/2. ドラゴニュート.
// 進化コスト4：これは進化する。
// 進化コスト1：これは進化する。この能力は自分の場に『金色の威信・リュミオール』がいるなら使える。
// (Evolve (4). Evolve (1), only if there is a Lumiore, Prestigious Gold (BP21-058) on your field.)
import { defineCard, evolveAbility } from "../helpers";
import { named } from "../targets";
import { LUMIORE, onYourField } from "./shared";

export default defineCard({
  abilities: [evolveAbility(4), evolveAbility(1, { condition: (g, c) => onYourField(g, c, named(LUMIORE)) })],
});
