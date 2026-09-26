// BP10-020 VII. Oluon, Runaway Chariot — Swordcraft advanced follower, 7, 7/7. アルカナ・指揮官.
// This follower can't attack enemies. (Neither leaders nor followers — ruling.)
// At the start of your end phase, do the following 2 times. Roll a 6-sided die. If you roll a 1 or 2,
// destroy each enemy follower on the field. If you roll a 3 or 4, deal 7 damage to each enemy leader.
// If you roll a 5 or 6, deal 7 damage to your leader. (Both rolls happen even if a leader reaches 0;
// the game is decided afterwards, both at 0 is a draw — ruling, CR 11.2.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  cannotAttack: true,
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        for (let i = 0; i < 2; i++) {
          const roll = yield* fx.rollDie();
          if (roll <= 2) yield* fx.destroy(fx.game.followers(opponent));
          else if (roll <= 4) yield* fx.dealDamage(fx.game.leader(opponent), 7);
          else yield* fx.dealDamage(fx.game.leader(fx.controller), 7);
        }
      },
    }),
  ],
});
