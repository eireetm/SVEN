// BP19-078 Abyssal Colonel — Abysscraft follower, 3, 3/3. 八獄・死者.
// {[evolve]} {[cost01]}: Evolve this.
// Necrocharge (10) - This has Storm. (CR 13.5.1.)
// {[lastwords]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, evolveAbility } from "../helpers";
import { colonelLastWords } from "./shared-abyss";

export default defineCard({
  selfKeywords: (g, self) => (g.necrocharge(g.controller(self), 10) ? ["storm"] : []),
  abilities: [evolveAbility(1), colonelLastWords],
});
