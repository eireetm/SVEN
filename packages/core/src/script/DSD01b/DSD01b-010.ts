// DSD01b-010 片倉小十郎 (Katakura Kojuro) — Dragoncraft follower, 2, 2/2. 武闘竜人.
// Japanese-only data (no English text); implemented from the Japanese:
// 進化コスト1：これは進化する。 ({[evolve]} {[cost01]}: Evolve this follower.)
// ファンファーレ自分の場の他の武闘竜人・フォロワー1体を選ぶ。【覚醒】状態なら、それは攻撃力+1/体力+1する。
// ({[fanfare]} Select another Draconic Duelist follower on your field. If Overflow is active for you, give it +1/+1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [anotherYourFollower({ filter: draconicDuelist })],
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
