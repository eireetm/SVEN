// CP04-013 Lima — Forestcraft follower, 1, 3/3. プリコネ・エリザベスパーク.
// This can only be played if it's your 5th turn or later. (CR 3.3.2 turns passed. Putting it onto the field by an effect isn't
// playing it — rulings.)
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  playableIf: (g, _self, player) => g.activePlayer === player && g.turnsPassed(player) >= 5,
  abilities: [evolveAbility(1)],
});
