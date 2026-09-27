// CP04-007 Anemone — Forestcraft follower, 1, 1/2. プリコネ・〈ジオ・ゲヘナ〉.
// {[ub]}{[fanfare]} Deal 1 damage to each enemy leader. Give your leader {[defense]}+1.
// Ward.
// When this is put into your EX area, deal 1 damage to each enemy leader and give your leader {[defense]}+1. (From any zone,
// during either player's turn; two put there together trigger twice — rulings.)
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, ub, whenThisPutIntoYourEx } from "../helpers";
import { damageEnemyLeader } from "./shared";

function* pingAndHeal(fx: EffectContext) {
  yield* damageEnemyLeader(fx, 1);
  yield* fx.giveLeaderDefense(fx.controller, 1);
}

export default defineCard({
  keywords: ["ward"],
  abilities: [ub(fanfare({ resolve: pingAndHeal })), whenThisPutIntoYourEx({ resolve: pingAndHeal })],
});
