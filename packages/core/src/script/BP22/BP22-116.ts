// BP22-116 〔勝利目指して〕ハルウララ — Forestcraft follower (Umamusume universe), 2, 1/3. ウマ娘.
// 自分のウマ娘・カードの能力によってこれを自分の手札から捨てたとき、1枚引く。
// 食事コスト1：これは出走する。
// ファンファーレ自分の場の他のウマ娘・フォロワー1体を選ぶ。それは攻撃力+1/体力+1する。
// (When this is discarded from your hand by the ability of an Umamusume card of yours, draw a card. Serve {[cost01]}: Race this
// follower (CR 14.2.2). Fanfare - Select another Umamusume follower on your field and give it +1/+1.)
import { defineCard, fanfare, serveAbility, whenDiscardedByYourCard } from "../helpers";
import { anotherYourFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    whenDiscardedByYourCard(
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
      (cause) => cause.traits.includes("ウマ娘"),
    ),
    serveAbility(1, 1),
    fanfare({
      targets: [anotherYourFollower({ filter: umamusume })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
