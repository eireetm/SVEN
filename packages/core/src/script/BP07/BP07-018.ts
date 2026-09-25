// BP07-018 Bayleon, Sovereign Light — Swordcraft follower, 3, 3/3. 自然・指揮官・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { treeOntoFieldOrEx } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1), fanfare({ resolve: treeOntoFieldOrEx })],
});
