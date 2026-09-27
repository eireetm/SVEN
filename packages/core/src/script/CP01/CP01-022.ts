// CP01-022 Sirius Symboli — Swordcraft follower, 4, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Bane.
import { defineCard, serveAbility } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [serveAbility(1, 1)],
});
