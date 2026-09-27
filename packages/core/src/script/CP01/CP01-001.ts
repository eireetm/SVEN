// CP01-001 Silence Suzuka — Forestcraft follower, 4, 4/1. ウマ娘.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Storm.
import { defineCard, evolveAbility, serveAbility } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [evolveAbility(2), serveAbility(1, 1)],
});
