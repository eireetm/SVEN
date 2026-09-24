// BP03-097 White Knight — Havencraft follower, 6, 6/6. 信仰.
// If your leader's defense is 5 or less, this card costs 5 less.
// Rush. Ward.
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["rush", "ward"],
  playCost: (g, _self, p) => (g.state.players[p].leaderDefense <= 5 ? -5 : 0),
});
