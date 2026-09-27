// DSD01b-001 気高き雷・ロマロニア (Romaronia) — Dragoncraft follower, 3, 1/3. ドラゴニュート・武闘竜人.
// Japanese-only data (no English text); implemented from the Japanese:
// 進化コスト1：これは進化する。 ({[evolve]} {[cost01]}: Evolve this follower.)
// 【必殺】 (Bane.)
// ラストワード自分の場に『遺されし電撃』があるなら、自分の場の『遺されし電撃』すべてに雷カウンター1個を置く。
// 自分の場に『遺されし電撃』がないなら、『遺されし電撃』1つを場に出す。
// ({[lastwords]} If there is an Aftershock on your field, place a lightning counter on each Aftershock on your field. If there is no
// Aftershock on your field, summon an Aftershock.)
import { defineCard, evolveAbility } from "../helpers";
import { romaroniaLastWords } from "./shared";

export default defineCard({ keywords: ["bane"], abilities: [evolveAbility(1), romaroniaLastWords] });
