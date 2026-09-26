// BP19-050 Electrokitty — Runecraft follower, 2, 2/2. 魔法生物.
// {[evolve]} {[cost01]}: Evolve this.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1)],
});
