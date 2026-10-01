// BP22-007 アイヴィーキング — Forestcraft follower, 7, 4/4. 植物族.
// これをプレイする際、コストを-Xする。Xは「自分のEXエリアの妖精・カードの枚数」である。
// ファンファーレ相手の場のフォロワー1体を選ぶ。それを破壊する。2枚引く。自分の手札1枚を捨てる。
// (This costs X less to play, X = the number of Pixie cards in your EX area. Fanfare - Select an enemy follower on the field and
// destroy it. Draw 2 cards, then discard a card. Without a follower to select, the Fanfare can't be played, so nothing is drawn
// — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { pixiesInEx } from "./shared";

export default defineCard({
  playCost: (g, _self, player) => -pixiesInEx(g, player),
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy([fx.targets[0]![0]!]);
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
