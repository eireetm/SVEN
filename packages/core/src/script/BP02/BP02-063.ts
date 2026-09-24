// BP02-063 Wildfang Dragonewt — Dragoncraft follower, 3, 4/3.
// If you discarded a card this turn, this card costs 2 less to play. (CR 10.4.4.1)
import { defineCard } from "../helpers";

export default defineCard({
  playCost: (g, _self, controller) => (g.discardedThisTurn(controller) > 0 ? -2 : 0),
});
