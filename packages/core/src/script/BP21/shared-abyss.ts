// Shared pieces of BP21 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import { activated, followerStrike, whenYouRollADie } from "../helpers";
import { enemyFollower } from "../targets";

/** "Do the following N times. "Roll a 6-sided die."" (BP21-074, 078, 080; CR 5.20.) */
export function* rollDice(fx: EffectContext, times: number): Proc<void> {
  for (let i = 0; i < times; i++) yield* fx.rollDie();
}

/** The result of the roll that triggered a "whenever you roll a 6-sided die" ability. */
export const rolled = (fx: EffectContext): number => fx.data?.count ?? 0;

/**
 * BP21-077 / 078 "Whenever you roll a 6-sided die, select an enemy follower on the field and deal it 1 damage. If you roll
 * a 6, deal it 3 damage instead."
 */
export const arkaSpin = whenYouRollADie({
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, rolled(fx) === 6 ? 3 : 1);
  },
});

/** BP21-083 / 087 "{[act]} {[cost00]}: Roll a 6-sided die. Activate only once per turn." */
export const rollOncePerTurn = activated(
  {},
  {
    timesPerTurn: 1,
    *resolve(fx) {
      yield* fx.rollDie();
    },
  },
);

/** BP21-085 / 086 "Follower Strike - Deal each enemy leader damage equal to this follower's attack." (Counted as it resolves.) */
export const bonebreakerStrike = followerStrike({
  *resolve(fx) {
    const attack = fx.game.card(fx.self)?.zone === "field" ? (fx.game.info(fx.self).attack ?? 0) : 0;
    if (attack > 0) yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], attack);
  },
});
