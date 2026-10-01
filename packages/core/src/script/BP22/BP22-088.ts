// BP22-088 よろめく不死者 — Abysscraft follower, 2, 2/2. 死者.
// ファンファーレこれが墓場から場に出ていたなら、これは攻撃力+1/体力+1する。
// ラストワード相手プレイヤーすべては、自身の場のフォロワー1体を墓場に置く。
// (Fanfare - If this was put onto the field from the cemetery, give it +1/+1. Last Words - Each opponent puts a follower on their
// field into their cemetery (they choose; burying is not destroying, so "can't be destroyed by abilities" and Aura don't stop it —
// ruling, CR 5.34).)
import { defineCard, fanfare, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.enteredFrom(fx.self) === "cemetery" && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    lastWords({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        const chosen = yield* fx.chooseCards(fx.game.followers(opp), 1, 1, opp);
        yield* fx.bury(chosen);
      },
    }),
  ],
});
