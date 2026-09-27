// ECP02-065 Kako Takafuji [Lady Luck] — Havencraft follower, 3, 3/3. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this.
// You may reroll each die or dice roll you make once. (CR 5.20.2: right after each roll, on either player's turn; the rerolled result
// can't be referred to; two copies let you reroll twice — rulings.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  field: { dieRerolls: 1 },
  abilities: [evolveAbility(1)],
});
