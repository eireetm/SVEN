// BP22-082 スカーレットヴァンパイア — Abysscraft follower, 5, 3/4. 吸血鬼.
// 進化コスト1：これは進化する。
// (Evolve (1).)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ abilities: [evolveAbility(1)] });
