// BP22-036 放浪の騎士 — Swordcraft follower, 2, 3/1. 兵士.
// 【突進】
// ラストワード『ナイト』1枚を場かEXエリアに置いてよい。
// (Rush. Last Words - You may put a Knight token onto your field or into your EX area: only a zone with room is offered.)
import { defineCard, lastWords } from "../helpers";
import { KNIGHT } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      *resolve(fx) {
        const g = fx.game;
        const p = fx.controller;
        const options: { id: string; label: string }[] = [];
        if (g.cards(p, "field").length < g.fieldLimit(p)) options.push({ id: "field", label: "Put it onto your field" });
        if (g.cards(p, "ex").length < g.exAreaLimit(p)) options.push({ id: "ex", label: "Put it into your EX area" });
        if (options.length === 0) return;
        options.push({ id: "none", label: "Don't put it" });
        const [pick] = yield* fx.choose(options);
        if (pick === "field") yield* fx.summon([KNIGHT]);
        else if (pick === "ex") yield* fx.tokensToEx([KNIGHT]);
      },
    }),
  ],
});
