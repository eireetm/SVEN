// ECP02-064 Miyu Mifune [Rouge Couture] — Havencraft follower, 3, 3/3. デレマス・クール.
// {[fanfare]} Search your deck for a 1-cost iM@S CG follower, summon it, then shuffle. (元のコスト.)
// {[act]} {[cost01]}, Lesson (1), {[engage]}: Search your deck for a 1-cost iM@S CG follower, summon it, then shuffle.
import type { EffectContext } from "../../engine/effects/context";
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { followerThat, imas } from "./shared";

function* summonOneCost(fx: EffectContext) {
  yield* fx.search((id) => followerThat(imas)(fx.game, id) && fx.game.info(id).cost === 1, { to: "field" });
}

export default defineCard({
  abilities: [
    fanfare({ resolve: summonOneCost }),
    activated({ playPoints: 1, engageSelf: true, custom: lesson(1) }, { resolve: summonOneCost }),
  ],
});
