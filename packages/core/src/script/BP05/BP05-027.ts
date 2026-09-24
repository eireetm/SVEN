// BP05-027 Geno, Machine Artisan — Swordcraft follower, 2, 2/2. 指揮官・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
// Whenever you play an amulet, select a follower on your field and give it {[defense]}+1.
import { defineCard, evolveAbility } from "../helpers";
import { genoAmuletPlayed } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), genoAmuletPlayed],
});
