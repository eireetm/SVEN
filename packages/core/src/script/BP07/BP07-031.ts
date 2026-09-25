// BP07-031 Dauntless Commander — Swordcraft follower, 2, 2/3. 指揮官.
// {[evolve]} {[cost01]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1)],
});
