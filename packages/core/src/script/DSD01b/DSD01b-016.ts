// DSD01b-016 残影のドラゴニュート (Afterimage Dragonewt) — Dragoncraft follower, 1, 2/1. ドラゴニュート・武闘竜人.
// Japanese-only data (no English text); implemented from the Japanese:
// 自分の場に他の武闘竜人・カードがある限り、これは【突進】【指定攻撃】を持つ。
// (While there is another Draconic Duelist card on your field, this follower has Rush and Assail. Aftershock counts — ruling.)
// ファンファーレコスト1：【覚醒】状態なら、自分のデッキから『残影のドラゴニュート』1枚を探し、場に出す。
// ({[fanfare]} {[cost01]}: If Overflow is active for you, search your deck for a 残影のドラゴニュート, summon it, then shuffle.
// CR 10.4.7.4: the cost may be paid without Overflow, and then nothing happens.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { withAnotherDuelist } from "./shared";

const AFTERIMAGE = "残影のドラゴニュート";

export default defineCard({
  selfKeywords: withAnotherDuelist(["rush", "assail"]),
  abilities: [
    fanfare({
      cost: playPointsCost(1),
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.search((id) => named(AFTERIMAGE)(fx.game, id), { to: "field" });
      },
    }),
  ],
});
