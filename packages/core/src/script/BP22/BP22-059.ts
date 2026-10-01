// BP22-059 オーシャンスター・ジゼル — Dragoncraft follower, 6, 2/4. 海洋.
// 自分の場に他の海洋・フォロワーが出たとき、それは攻撃力+1/体力+1する。
// ファンファーレ自分のデッキから「カード名に『ホエール』を含む海洋・フォロワー」1枚を探し、EXエリアに置く。このターン、それをプレイする際、コストを
// -5する。
// (Whenever another Marine follower is put onto your field — during the opponent's turn too (ruling) — give it +1/+1. Fanfare - Search
// your deck for a Marine follower with ホエール (Whale) in its name, put it into your EX area; it costs 5 less to play this turn.
// The Japanese name is matched: e.g. BP05-065 エアシップホエール, BP10-062, BP17-065.)
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { isFollower } from "../targets";
import { marine } from "./shared";

/** "カード名に『ホエール』を含む" — by the Japanese name (BP22 is implemented from the Japanese text; "Whale" in English). */
const whale = (g: GameReader, id: CardId): boolean => (g.info(id).def.names.ja ?? g.info(id).name).includes("ホエール");

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 1, 1);
        },
      },
      { another: true, filter: marine },
    ),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const found = yield* fx.search((id) => isFollower(g, id) && marine(g, id) && whale(g, id), { to: "ex" });
        for (const card of found) yield* fx.changePlayCost(card, -5, "endOfTurn");
      },
    }),
  ],
});
