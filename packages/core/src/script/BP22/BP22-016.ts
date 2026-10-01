// BP22-016 悪戯の精霊 — Forestcraft follower, 4, 4/4. 精霊.
// ファンファーレ『フェアリー』2枚をEXエリアに置く。
// 起動EXエリアの『フェアリー』2枚を消滅：相手の場のフォロワー1体を選ぶ。それを手札に戻す。（手札に戻ったトークンはゲームから取り除く）
// (Fanfare - Put 2 Fairy tokens into your EX area. Activate - Banish 2 Fairies from your EX area: select an enemy follower on the
// field and return it to its owner's hand (a token is removed, CR 9.1.4). Without a follower to select it can't be activated,
// so the cost isn't paid — ruling, CR 10.6.2.3.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";
import { FAIRY } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY, FAIRY]);
      },
    }),
    activated(
      { custom: banishFromYourEx(named(FAIRY), 2) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.returnToHand([fx.targets[0]![0]!]);
        },
      },
    ),
  ],
});
