// CP04-023 Jun — Swordcraft follower, 4, 3/4. プリコネ・NIGHTMARE.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1)],
});
