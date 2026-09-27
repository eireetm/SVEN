// CP04-025 Lily — Swordcraft follower, 5, 4/3. プリコネ・アルターメイデン.
// {[ub]}{[fanfare]} / Strike - Draw a card. You may summon a follower that costs 2 or less from your hand. (Two Union Burst
// abilities — ruling. 元のコスト.)
// Rush.
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, strike, ub } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, maySummonFromHand } from "./shared";

function* drawAndSummon(fx: EffectContext) {
  yield* fx.draw(1);
  yield* maySummonFromHand(fx, followerThat(costAtMost(2)));
}

export default defineCard({
  keywords: ["rush"],
  abilities: [ub(fanfare({ resolve: drawAndSummon })), ub(strike({ resolve: drawAndSummon }))],
});
