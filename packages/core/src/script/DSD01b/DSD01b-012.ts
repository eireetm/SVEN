// DSD01b-012 大鎌の竜騎 (Great scythe dragon rider) — Dragoncraft follower, 2, 2/2. 竜使い・武闘竜人.
// Japanese-only data (no English text); implemented from the Japanese:
// 【必殺】 (Bane.)
// 自分の場に他の武闘竜人・カードがある限り、これは【疾走】を持つ。
// (While there is another Draconic Duelist card on your field, this follower has Storm. Aftershock counts — ruling.)
import { defineCard } from "../helpers";
import { withAnotherDuelist } from "./shared";

export default defineCard({ keywords: ["bane"], selfKeywords: withAnotherDuelist(["storm"]) });
