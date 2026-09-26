// BP10-076 XIV. Luzen, Temperance — Abysscraft follower, 7, 5/5. アルカナ・魔界.
// If your leader would take damage, it takes that much minus 1 instead. (Two of them: minus 2; the
// affected player orders it with other changes, CR 10.10.2; "-X defense" isn't damage — rulings.)
// Opponents can't draw cards outside of their start phase. (Adding cards to the hand otherwise still
// works; an effect's other parts still happen — rulings, CR 1.3.3.)
// {[fanfare]} Each player discards down to 2 cards. (Each chooses; the turn player first, CR 1.3.4.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  field: {
    damageToLeader: (g, self, damage) => (damage.target === g.leader(g.controller(self)) ? -1 : 0),
    forbidsDraw: (g, self, player, startPhase) => player !== g.controller(self) && !startPhase,
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        const first = fx.game.activePlayer;
        for (const p of [first, fx.game.opponent(first)]) {
          const extra = fx.game.cards(p, "hand").length - 2;
          if (extra > 0) yield* fx.discard(p, extra, extra);
        }
      },
    }),
  ],
});
