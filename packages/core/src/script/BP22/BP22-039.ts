// BP22-039 プレデターゴーレム — Runecraft follower, 9, 6/6. ゴーレム.
// これをプレイする際、【土の秘術_9】：コストを1にする。
// 【守護】
// ファンファーレ相手の場のフォロワー3体まで選ぶ。それを破壊する。相手のリーダーすべてに3ダメージ。自分のリーダーは体力+3する。
// (When playing this card, Earth Rite (9): this card costs 1 to play — an optional additional cost removing 9 Stack counters from
// one amulet (CR 10.4.7.3, 13.3.3; ruling). Ward. Fanfare - Select up to 3 enemy followers on the field and destroy them; deal 3
// damage to each enemy leader and give your leader +3 defense — also with no follower selected (ruling).)
import { earthRiteOption } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  playOptions: [earthRiteOption(9, { id: "rite9", label: "Earth Rite (9): this costs 1", setCost: 1 })],
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 3, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
