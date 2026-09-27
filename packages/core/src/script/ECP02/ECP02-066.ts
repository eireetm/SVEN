// ECP02-066 Kako Takafuji [Lady Luck] (Evolved) — 4/4.
// You may reroll each die or dice roll you make once. (CR 5.20.2: right after each roll, on either player's turn; the rerolled result
// can't be referred to; two copies let you reroll twice — rulings.)
// On Evolve - Roll a 6-sided die. If you roll a 1, draw 2 cards. If you roll a 2, deal 3 damage to each enemy leader and give your
// leader {[defense]}+3. If you roll a 3, each opponent buries a follower with the highest attack among followers on their field.
// (CR 5.20.1; they choose among tied ones.)
import { defineCard, onEvolve } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  field: { dieRerolls: 1 },
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const roll = yield* fx.rollDie();
        if (roll === 1) yield* fx.draw(2);
        if (roll === 2) {
          yield* damageEnemyLeader(fx, 3);
          yield* fx.giveLeaderDefense(fx.controller, 3);
        }
        if (roll === 3) {
          const opp = g.opponent(fx.controller);
          const attack = (id: string) => g.statsOf(id).attack ?? 0;
          const followers = g.followers(opp);
          if (followers.length === 0) return;
          const most = Math.max(...followers.map(attack));
          yield* fx.bury(yield* fx.chooseCards(followers.filter((id) => attack(id) === most), 1, 1, opp));
        }
      },
    }),
  ],
});
