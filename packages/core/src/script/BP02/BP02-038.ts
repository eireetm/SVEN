// BP02-038 Anne, Belle of Mysteria — Runecraft follower, 4, 4/5.
// If there is a Grea the Dragonborn on your field, this card costs 2 less to play. (Still 2 with
// two Greas — ruling; CR 10.4.4.1.)
// {[evolve]}{[cost01]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";
import { named } from "../targets";

export default defineCard({
  playCost: (g, _self, controller) => (g.cards(controller, "field").some((id) => named("Grea the Dragonborn")(g, id)) ? -2 : 0),
  abilities: [evolveAbility(1)],
});
