// DSD01a-014 マナリアの知識 (Mysterian knowledge) — Runecraft spell, 1. 魔法使い・学院.
// Japanese-only data (no English text); implemented from the Japanese:
// これをプレイする際、追加コストとして手札の学院・カード2枚を公開する。（追加コストを支払わなければプレイできない）
// 1枚引く。『マナリアの魔弾』1枚をEXエリアに置く。
// (As an additional cost to play this, reveal 2 Academic cards from your hand; it can't be played without paying it. Draw a card.
// Put a マナリアの魔弾 token into your EX area. Not this card itself, and not from the cemetery without the 2 cards — rulings.)
import { revealFromHand } from "../costs";
import { defineCard, spell } from "../helpers";
import { MAGIC_BULLET, academic } from "./shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "reveal2", label: "Reveal 2 Academic cards from your hand", ...revealFromHand(academic, 2) }],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.tokensToEx([MAGIC_BULLET]);
      },
    }),
  ],
});
