// DSD01a-010 マナリアの召喚士・ベリル (Mysterian summoner Beryl) — Runecraft follower, 4, 2/2. 魔法使い・魔法生物・学院.
// Japanese-only data (no English text); implemented from the Japanese:
// 進化コスト1：これは進化する。 ({[evolve]} {[cost01]}: Evolve this follower.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ abilities: [evolveAbility(1)] });
