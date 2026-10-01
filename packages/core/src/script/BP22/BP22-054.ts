// BP22-054 ゴーレムアサルト — Runecraft spell, 1. 錬金術師・ゴーレム.
// 『防御型ゴーレム』1枚と『攻撃型ゴーレム』1枚をEXエリアに置く。【土の秘術】自分のEXエリアのゴーレム・フォロワーすべては攻撃力+1/体力+1する。
// (Put a Guardform Golem and a Strikeform Golem token into your EX area — with room for one, you choose which (ruling). Earth Rite:
// give each Golem follower in your EX area +1/+1 (kept on the field, CR 4.8.3.3).)
import { defineCard, spell } from "../helpers";
import { isFollower } from "../targets";
import { golem, GUARDFORM_GOLEM, STRIKEFORM_GOLEM } from "./shared";

export default defineCard({
  abilities: [
    spell({
      earthRite: { mode: "optional" },
      *resolve(fx) {
        yield* fx.tokensToEx([GUARDFORM_GOLEM, STRIKEFORM_GOLEM]);
        if (!fx.earthRitePaid) return;
        const g = fx.game;
        for (const id of g.cards(fx.controller, "ex").filter((c) => isFollower(g, c) && golem(g, c))) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
