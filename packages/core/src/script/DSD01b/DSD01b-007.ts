// DSD01b-007 白亜の竜騎士 (White chalk dragon knight) — Dragoncraft follower, 5, 3/4. 竜使い・武闘竜人.
// Japanese-only data (no English text); implemented from the Japanese:
// ファンファーレ自分のデッキから元のコスト4以下の武闘竜人・フォロワー1枚を探し、場に出す。【覚醒】状態なら、自分のリーダーは体力+3する。
// ({[fanfare]} Search your deck for a Draconic Duelist follower that costs 4 or less, summon it, then shuffle. If Overflow is active
// for you, give your leader +3 defense. Only the +3 depends on Overflow.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const filter = and(isFollower, draconicDuelist, costAtMost(4));
        yield* fx.search((id) => filter(fx.game, id), { to: "field" });
        if (fx.game.overflow(fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
