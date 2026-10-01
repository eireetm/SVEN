// BP22-087 霹靂の悪魔 (evolved) — Abysscraft, 4/5. 魔界.
// 【進化時】相手の場のフォロワー1体を選ぶ。それに2ダメージ。自分のリーダーは体力+2する。1枚引く。
// (On Evolve - The same as BP22-086's Fanfare; nothing without a follower to select — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { thunderDevil } from "./shared-abyss";

export default defineCard({ abilities: [onEvolve(thunderDevil)] });
