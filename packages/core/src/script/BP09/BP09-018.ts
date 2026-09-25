// BP09-018 Celia, Sky Commander — Swordcraft follower, 1, 2/2. 指揮官.
// {[evolve]} {[cost01]}: Evolve this follower into a Celia, Hope's Strategist.
// {[evolve]} {[cost04]}: Evolve this follower into a Celia, Despair's Messenger.
// (The two faces of the double-faced BP09-019, CR 4.6.4.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1, { into: ["Celia, Hope's Strategist"] }), evolveAbility(4, { into: ["Celia, Despair's Messenger"] })],
});
