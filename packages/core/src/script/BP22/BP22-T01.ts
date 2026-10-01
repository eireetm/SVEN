// BP22-T01 聖女の号令 — Havencraft spell token, 1. 先導.
// 自分の場の【守護】を持つフォロワー2体まで選ぶ。それは【疾走】を持つ。
// (Select up to 2 followers with Ward on your field; they gain Storm.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ count: 2, upTo: true, filter: (g, id) => g.info(id).keywords.includes("ward") })],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) yield* fx.giveKeyword(id, "storm");
      },
    }),
  ],
});
