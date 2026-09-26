// BP18-024 Bird's-Eye Investigator — Swordcraft follower, 4, 3/3. 透京・探偵.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1)],
});
