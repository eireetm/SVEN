// ECP01-001 Hokko Tarumae — Forestcraft follower, 4, 2/2. ウマ娘.
// This card costs X less to play. X equals the number of Umamusume cards on your field.
// ----------
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
import { defineCard, evolveAbility, serveAbility } from "../helpers";
import { umamusumeOnYourField } from "./shared";

export default defineCard({
  playCost: (g, _self, c) => -umamusumeOnYourField(g, c),
  abilities: [evolveAbility(1), serveAbility(1, 1)],
});
