// BP22-111 安寧の降臨 — Neutral spell, 3. 超克.
// 相手の場のカード1枚を選ぶ。それを破壊する。自分のSEPが0なら、『シャドウジェネラル』1体を場に出す。
// (Select an enemy card on the field and destroy it. If you have no super-evolution point, summon a シャドウジェネラル (BP22-T02)
// token — not before your super-evolution point is used: each player starts with 1 (ruling, CR 6.2.1.11). Not playable without a
// card to select (ruling).)
import { defineCard, spell } from "../helpers";
import { enemyCardOnField } from "../targets";
import { SHADOW_GENERAL } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyCardOnField()],
      *resolve(fx) {
        yield* fx.destroy([fx.targets[0]![0]!]);
        if (fx.game.state.players[fx.controller].superEvolutionPoints === 0) yield* fx.summon([SHADOW_GENERAL]);
      },
    }),
  ],
});
