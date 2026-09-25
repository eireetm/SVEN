// BP06-016 Elven Sentry — Forestcraft follower, 5, 4/4. エルフ族.
// This card costs 1 less to play for every Fairy on your field.
// Rush. Assail.
import { defineCard } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["rush", "assail"],
  playCost: (g, _self, controller) => -g.cards(controller, "field").filter((id) => named("Fairy")(g, id)).length,
});
