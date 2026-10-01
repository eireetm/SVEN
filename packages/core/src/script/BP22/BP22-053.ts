// BP22-053 氷結の魔獣 — Runecraft follower, 4, 4/4. ゴーレム・魔法生物.
// 【突進】
// 【攻撃時】『攻撃型ゴーレム』1体を場に出す。
// ファンファーレ相手の場のフォロワー2体まで選ぶ。それをアクトする。
// (Rush. Strike - Summon a Strikeform Golem token. Fanfare - Select up to 2 enemy followers on the field and engage them.)
import { defineCard, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { STRIKEFORM_GOLEM } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.summon([STRIKEFORM_GOLEM]);
      },
    }),
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0] ?? []);
      },
    }),
  ],
});
