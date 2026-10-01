// BP22-068 ヘイルドラゴン — Dragoncraft follower, 6, 4/6. 竜族.
// 進化コスト1：これは進化する。
// ファンファーレ手札の元のコスト7以上のドラゴンカード1枚を捨てる：相手の場のフォロワー2体まで選ぶ。それをアクトする。それは次のそれのプレイヤーの
// スタートフェイズにスタンドしない。
// (Evolve (1). Fanfare - Discard a Dragoncraft card that costs 7 or more: select up to 2 enemy followers on the field, engage them;
// they don't refresh during their controller's next start phase — an engaged one selected still doesn't (ruling, CR 7.2.3).)
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtLeast, enemyFollower, isClass } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      cost: discardA((g, id) => isClass("Dragoncraft")(g, id) && costAtLeast(7)(g, id)),
      *resolve(fx) {
        const targets = (fx.targets[0] ?? []).filter((id) => fx.game.card(id)?.zone === "field");
        yield* fx.engage(targets);
        for (const id of targets) yield* fx.skipNextRefresh(id);
      },
    }),
  ],
});
