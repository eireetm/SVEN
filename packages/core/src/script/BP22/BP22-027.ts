// BP22-027 アックスパイレーツ — Swordcraft follower, 3, 2/3. 盗賊.
// 進化コスト1：これは進化する。
// ファンファーレ自分の場に指揮官・盗賊・フォロワーがいるなら、これは進化する。
// (Evolve (1). Fanfare - If there is a follower with both the Commander and Thief traits on your field (「A・B・フォロワー」, as
// BP19-029), evolve this — an effect's evolution (ruling).)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isFollower } from "../targets";
import { commander, onYourField, thief } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const captain = onYourField(fx.game, fx.controller, (g, id) => isFollower(g, id) && commander(g, id) && thief(g, id));
        if (captain && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
