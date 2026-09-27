// CP04-067 Mifuyu — Dragoncraft follower, 2, 2/3. プリコネ・メルクリウス財団.
// This costs 2 less to play if Overflow is active for you.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  playCost: (g, _self, controller) => (g.overflow(controller) ? -2 : 0),
  abilities: [evolveAbility(1)],
});
