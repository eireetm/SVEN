// ECP01-024 Vivlos — Runecraft follower, 3, 5/2. ウマ娘.
// This card costs 2 less to play if there's a Cheval Grand or Verxina on your field.
// ----------
// {[feed]} {[cost01]}: Race this follower.
// Rush. Assail.
import { defineCard, serveAbility } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["rush", "assail"],
  playCost: (g, _self, c) => (g.cards(c, "field").some((id) => named("Cheval Grand")(g, id) || named("Verxina")(g, id)) ? -2 : 0),
  abilities: [serveAbility(1, 1)],
});
