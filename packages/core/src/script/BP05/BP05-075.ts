// BP05-075 Disciple of Lust — Abysscraft follower, 1, 1/1. 絶傑・魔界.
// {[fanfare]}: Deal 1 damage to each leader.
// Strike: Deal 1 damage to each leader.
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, strike } from "../helpers";

function* eachLeader(fx: EffectContext) {
  yield* fx.dealDamageEach([fx.game.leader(fx.controller), fx.game.leader(fx.game.opponent(fx.controller))], 1);
}

export default defineCard({
  abilities: [fanfare({ resolve: eachLeader }), strike({ resolve: eachLeader })],
});
