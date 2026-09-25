// BP06-029 Samurai Outlaw — Swordcraft follower, 2, 3/2. 兵士.
// {[evolve]} {[cost04]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(4)],
});
