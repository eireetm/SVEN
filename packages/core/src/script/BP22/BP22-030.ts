// BP22-030 シールドフォーメーション — Swordcraft spell, 1. 兵士.
// 『スティールナイト』1枚と『シールドガーディアン』1枚と『ナイト』1枚をEXエリアに置く。自分のEXエリアのカードが5枚なら、このターン、次に自分が
// ロイヤルトークン・フォロワーをプレイする際、コストを-2する。
// (Put a Steelclad Knight, a Shield Guardian and a Knight token into your EX area — with room for fewer, you choose which (ruling).
// If there are 5 cards in your EX area (those count — ruling; 「5枚なら」 is exactly 5), the next Swordcraft token follower you
// play this turn costs 2 less.)
import { defineCard, spell } from "../helpers";
import { isClass, isFollower, isToken } from "../targets";
import { KNIGHT, SHIELD_GUARDIAN, STEELCLAD_KNIGHT } from "./shared";

export default defineCard({
  nextPlay: { swordToken: (g, card) => isFollower(g, card) && isToken(g, card) && isClass("Swordcraft")(g, card) },
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.tokensToEx([STEELCLAD_KNIGHT, SHIELD_GUARDIAN, KNIGHT]);
        if (fx.game.cards(fx.controller, "ex").length === 5) yield* fx.nextPlayCostsLess("swordToken", 2);
      },
    }),
  ],
});
