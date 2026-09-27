// CP04-031 Tamaki — Swordcraft follower, 1, 1/1. プリコネ・メルクリウス財団.
// {[evolve]} {[cost01]}: Evolve this.
// Storm.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [evolveAbility(1)],
});
