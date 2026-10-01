// BP22-085 フギン＆ムニン — Abysscraft follower, 2, 2/2. 魔界.
// ファンファーレ下記から1つチョイスする。【1】これは攻撃力+1する。【2】これは【疾走】を持つ。【3】コスト1：自分のデッキから『フギン＆ムニン』1枚を探し、
// 場に出す。
// (Fanfare - Choose one: (1) give this +1/+0; (2) this gains Storm; (3) {[cost01]}: search your deck for a フギン＆ムニン and summon it
// (an optional cost, CR 10.4.7.5). The Chinese text lacks the Fanfare icon; the Japanese text has it — data/fixes.ts.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { HUGINN_AND_MUNINN } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "attack",
          label: "This gets +1 attack",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
          },
        },
        {
          id: "storm",
          label: "This gains Storm",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
          },
        },
        {
          id: "search",
          label: "Pay 1: summon a フギン＆ムニン from your deck",
          cost: playPointsCost(1),
          *resolve(fx) {
            yield* fx.search((id) => named(HUGINN_AND_MUNINN)(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
