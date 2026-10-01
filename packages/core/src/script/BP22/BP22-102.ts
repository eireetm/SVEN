// BP22-102 天昇のプリズムプリースト — Havencraft follower, 2, 2/3. 先導・鳥族.
// ファンファーレ自分の手札の元のコスト2以下のアミュレット1枚を場に出してよい。
// 起動場のアミュレット3つをアクト：これは攻撃力+1/体力+1する。自分のリーダーは体力+2する。
// (Fanfare - You may put an amulet that costs 2 or less (元のコスト) from your hand onto your field. Activate - Engage 3 amulets on
// your field (CR 10.4.3, 10.4.6): give this +1/+1 and your leader +2 defense.)
import { engageYourCards } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";
import { costOf } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const amulets = g.cards(fx.controller, "hand").filter((id) => isAmulet(g, id) && (costOf(g, id) ?? Infinity) <= 2);
        const chosen = yield* fx.chooseCards(amulets, 0, 1);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
      },
    }),
    activated(
      { custom: engageYourCards(isAmulet, 3) },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
