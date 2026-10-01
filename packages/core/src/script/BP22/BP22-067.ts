// BP22-067 貫く咆哮 — Dragoncraft spell, 7. 竜族.
// これをプレイする際、自分の場に『イグニスドラゴン』がいるなら、コストを-7する。
// 相手のリーダーすべてに2ダメージ。2枚引く。
// (This costs 7 less to play if there is an イグニスドラゴン (BP22-056) on your field. Deal 2 damage to each enemy leader and draw 2
// cards.)
import { defineCard, spell } from "../helpers";
import { named } from "../targets";
import { IGNIS_DRAGON, onYourField } from "./shared";

export default defineCard({
  playCost: (g, _self, player) => (onYourField(g, player, named(IGNIS_DRAGON)) ? -7 : 0),
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        yield* fx.draw(2);
      },
    }),
  ],
});
