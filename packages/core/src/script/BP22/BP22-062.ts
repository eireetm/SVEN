// BP22-062 ジュエルドラゴン — Dragoncraft follower, 1, 1/1. 竜族.
// これが場にいる限り、自分の場の『イグニスドラゴン』すべては【指定攻撃】を持つ。
// ファンファーレ下記から2つまでチョイスする。【1】自分の墓場の『貫く咆哮』1枚を選ぶ。それをEXエリアに置く。【2】コスト5：自分の墓場の『イグニス
// ドラゴン』1枚を選ぶ。それを場に出す。
// (While this is on the field, each イグニスドラゴン (BP22-056) on your field has Assail — an attack goes on if it loses it (ruling).
// Fanfare - Choose up to 2 (each once — ruling, CR 5.18): (1) select a 貫く咆哮 (BP22-067) in your cemetery and put it into your EX
// area; (2) {[cost05]}: select an イグニスドラゴン in your cemetery and put it onto your field (the cost is optional, asked when
// it resolves, CR 10.4.7.5).)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";
import type { FieldPassives } from "../types";
import { IGNIS_DRAGON, PIERCING_ROAR } from "./shared";

const ignisHaveAssail: NonNullable<FieldPassives["keywordsFor"]> = (g, self, card) => {
  const c = g.card(card);
  if (!c || c.zone !== "field" || g.controller(card) !== g.controller(self)) return [];
  return g.typeAndTraits(card).type === "follower" && g.namesOf(card).includes(IGNIS_DRAGON) ? ["assail"] : [];
};

export default defineCard({
  field: { keywordsFor: ignisHaveAssail },
  abilities: [
    fanfare({
      modeCount: () => 2,
      modes: [
        {
          id: "roar",
          label: "Put a 貫く咆哮 from your cemetery into your EX area",
          targets: [inYourZone("cemetery", { filter: named(PIERCING_ROAR) })],
          *resolve(fx) {
            yield* fx.putIntoEx(fx.targets[0] ?? []);
          },
        },
        {
          id: "ignis",
          label: "Pay 5: put an イグニスドラゴン from your cemetery onto your field",
          cost: playPointsCost(5),
          targets: [inYourZone("cemetery", { filter: named(IGNIS_DRAGON) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0] ?? []);
          },
        },
      ],
    }),
  ],
});
