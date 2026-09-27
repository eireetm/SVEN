// DSD01b-013 ガルグイユ (Gargouille) — Dragoncraft follower, 4, 4/5. ドラゴニュート・武闘竜人・キラー.
// Japanese-only data (no English text); implemented from the Japanese:
// 【突進】【守護】 (Rush. Ward.)
// ファンファーレ自分の場の武闘竜人・カードが3枚以上なら、2枚引く。
// ({[fanfare]} If there are at least 3 Draconic Duelist cards on your field, draw 2 cards. This one and Aftershock count — ruling.)
import { defineCard, fanfare } from "../helpers";
import { duelistCardsOnYourField } from "./shared";

export default defineCard({
  keywords: ["rush", "ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (duelistCardsOnYourField(fx.game, fx.controller) >= 3) yield* fx.draw(2);
      },
    }),
  ],
});
