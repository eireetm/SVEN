// BP06-019 Ralmia, Sonic Racer — Swordcraft follower, 2, 3/2. 兵士・超克.
// {[evolve]} {[cost03]}: Evolve this follower.
// This card's Evolve costs 1 less for every other follower on your field. (Down to 0 — ruling.)
// Rush.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  evolveCostChange: (g, self) => -g.followers(g.controller(self)).filter((id) => id !== self).length,
  abilities: [evolveAbility(3)],
});
