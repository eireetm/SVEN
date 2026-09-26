// BP20-050 Devotee of Destruction — Runecraft follower, 1, 1/1. 絶傑・アイドル.
// {[evolve]} {[cost01]}: Evolve this.
// Assail.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [evolveAbility(1)],
});
