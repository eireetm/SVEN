// CP01-023 Narita Taishin — Swordcraft follower, 2, 3/2. ウマ娘・BNW.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Rush.
import { defineCard, serveAbility } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [serveAbility(1, 1)],
});
