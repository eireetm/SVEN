// BP22-098 カースメイデン — Havencraft follower, 2, 2/2. 狂信.
// ファンファーレ自分のデッキから『ゴッド・オブ・カース』1枚を探し、手札に加える。
// 起動これをアクト墓場に置く：相手の場のフォロワーすべては攻撃力-2/体力-2する。この能力は自分の場に『ゴッド・オブ・カース』がいるなら使える。
// (Fanfare - Search your deck for a ゴッド・オブ・カース (BP22-092), reveal it and add it to your hand. Activate, engage this, bury this:
// give each enemy follower on the field -2/-2; only with a ゴッド・オブ・カース on your field.)
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { GOD_OF_CURSES, onYourField } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named(GOD_OF_CURSES)(fx.game, id));
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => onYourField(g, c, named(GOD_OF_CURSES)),
        *resolve(fx) {
          for (const id of fx.game.followers(fx.game.opponent(fx.controller))) yield* fx.giveStats(id, -2, -2);
        },
      },
    ),
  ],
});
