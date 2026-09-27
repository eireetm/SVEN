// CP04-075 Ranpha — Abysscraft follower, 4, 3/5. プリコネ・〈レイジ・レギオン〉.
// {[ub]}{[fanfare]} Select an enemy follower on the field. Deal it 5 damage and, if this wasn't put onto the field from hand, recover
// 2 play points. (From the EX area, deck or cemetery — ruling.)
// Whenever a {[ub]} ability of another follower on your field is executed, choose 1 that you haven't chosen this turn. (1) Deal 2
// damage to each enemy leader. (2) Give your leader {[defense]}+2. (Per Ranpha: another Ranpha's choices don't count — ruling. With
// both chosen, it can't be played.)
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader } from "./shared";

const DAMAGE = "CP04-075:1";
const HEAL = "CP04-075:2";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          if (fx.game.enteredFrom(fx.self) !== "hand") yield* fx.recoverPlayPoints(2);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      modes: [
        {
          id: "1",
          label: "Deal 2 damage to each enemy leader",
          available: (g, _c, self) => g.usesThisTurn(self, DAMAGE) === 0,
          *resolve(fx: EffectContext) {
            fx.recordUse(DAMAGE);
            yield* damageEnemyLeader(fx, 2);
          },
        },
        {
          id: "2",
          label: "Give your leader +2 defense",
          available: (g, _c, self) => g.usesThisTurn(self, HEAL) === 0,
          *resolve(fx: EffectContext) {
            fx.recordUse(HEAL);
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
      ],
    }),
  ],
});
