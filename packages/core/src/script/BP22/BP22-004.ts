// BP22-004 永久なる輝き・エリン (evolved) — Forestcraft, 3/5. クリスタリア.
// 自分の場に「これと同名を除くクリスタリア・フォロワー」が出たとき、それは進化する。
// 【進化時】このターン、次に自分がクリスタリア・カードをプレイする際、コストを-3する。
// (Whenever a Crystalia follower not named Erin is put onto your field, evolve it (see BP22-003). On Evolve - The next
// Crystalia card you play this turn costs 3 less.)
import { defineCard, onEvolve } from "../helpers";
import { crystalia } from "./shared";
import { erinEvolvesCrystalia } from "./shared-forest";

export default defineCard({
  nextPlay: { crystalia: (g, card) => crystalia(g, card) },
  abilities: [
    erinEvolvesCrystalia,
    onEvolve({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("crystalia", 3);
      },
    }),
  ],
});
