// BP22-107 温情のラビットヒーラー — Havencraft follower, 1, 1/1. 獣.
// ファンファーレ自分の場の獣・フォロワー1体を選ぶ。それは攻撃力+1/体力+1する。
// 起動コスト4：自分の場の獣・フォロワー1体を選ぶ。それは攻撃力+4/体力+4する。
// (Fanfare - Select a Beast follower on your field (this one too) and give it +1/+1. Activate {[cost04]}: select a Beast follower on
// your field and give it +4/+4.)
import { activated, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { beast } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: beast })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
    activated(
      { playPoints: 4 },
      {
        targets: [yourFollower({ filter: beast })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 4, 4);
        },
      },
    ),
  ],
});
