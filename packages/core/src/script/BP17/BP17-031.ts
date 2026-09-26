// BP17-031 Fox Lancer — Swordcraft follower, 2, 2/2. 自然・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area. (Neither is allowed — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { treeOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), fanfare({ resolve: treeOntoFieldOrEx })],
});
