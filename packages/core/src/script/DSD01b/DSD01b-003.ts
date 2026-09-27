// DSD01b-003 暴竜・伊達政宗 (Date Masamune) — Dragoncraft follower, 2, 2/2. 竜使い・武闘竜人.
// Japanese-only data (no English text); implemented from the Japanese:
// 【必殺】 (Bane.)
// ファンファーレ自分の場の武闘竜人・カードが3枚以上なら、これは攻撃力+2/体力+2して、【疾走】を持つ。
// ({[fanfare]} If there are at least 3 Draconic Duelist cards on your field, give this follower +2/+2 and Storm. This one and
// Aftershock count — ruling.)
import { defineCard, fanfare } from "../helpers";
import { duelistCardsOnYourField } from "./shared";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (duelistCardsOnYourField(fx.game, fx.controller) < 3) return;
        yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
