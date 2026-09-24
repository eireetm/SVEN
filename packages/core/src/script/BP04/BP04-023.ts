// BP04-023 Barbarossa — Swordcraft follower, 5, 6/5. 指揮官.
// If there are at least 3 enemy cards on the field, this card costs 2 less to play.
// {[evolve]} {[cost01]}: Evolve this follower. Assail.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  playCost: (g, _self, p) => (g.cards(g.opponent(p), "field").length >= 3 ? -2 : 0),
  abilities: [evolveAbility(1)],
});
