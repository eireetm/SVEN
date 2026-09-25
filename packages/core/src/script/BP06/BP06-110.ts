// BP06-110 Mithra, Daybreak Deity — Neutral follower, 6, 5/5. 光輝.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Each player rolls a 6-sided die. If they roll a 1, 2, or 3, they draw 2 cards. If
// they roll a 4, 5, or 6, they discard 2 random cards. (CR 5.20; the active player first, 1.3.4.1)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const active = fx.game.activePlayer;
        for (const p of [active, fx.game.opponent(active)]) {
          if ((yield* fx.rollDie(p)) <= 3) yield* fx.draw(2, p);
          else yield* fx.discardRandom(2, p);
        }
      },
    }),
  ],
});
