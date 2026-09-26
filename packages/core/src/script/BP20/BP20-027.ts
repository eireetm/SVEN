// BP20-027 Peppy Scout — Swordcraft follower, 4, 3/3. 兵士.
// {[evolve]} {[cost01]}: Evolve this.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1)],
});
