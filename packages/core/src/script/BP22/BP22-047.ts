// BP22-047 フェイクウィング・エリーナ (evolved) — Runecraft, 3/3. 超克.
// 【進化時】『エンシェントアーティファクト』1体を場に出す。自分の消滅領域が10枚以上なら、代わりに『エッジアーティファクト』1体を場に出す。
// (On Evolve - Summon an Ancient Artifact token; with at least 10 cards in your banished zone, a Keenedge Artifact (BP13-T05,
// エッジアーティファクト) instead.)
import { defineCard, onEvolve } from "../helpers";
import { ANCIENT_ARTIFACT, KEENEDGE_ARTIFACT } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([fx.game.cards(fx.controller, "banished").length >= 10 ? KEENEDGE_ARTIFACT : ANCIENT_ARTIFACT]);
      },
    }),
  ],
});
