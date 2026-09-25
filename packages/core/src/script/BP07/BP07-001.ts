// BP07-001 Ladica, the Stoneclaw — Forestcraft follower, 4, 5/5. 自然・獣.
// {[evolve]} {[cost01]}: Evolve this follower. Activate only if you've played at least 5 cards this
// turn. (CR 13.2.1 cards played this turn.)
// Whenever a Naterran Great Tree is put onto your field, recover 1 play point. (Each Ladica
// triggers, also during the opponent's turn — rulings.)
import { defineCard, evolveAbility } from "../helpers";
import { ladicaRecovers } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1, { condition: (g, c) => g.playedThisTurn(c) >= 5 }), ladicaRecovers],
});
