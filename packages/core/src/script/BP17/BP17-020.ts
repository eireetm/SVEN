// BP17-020 Mistolina & Bayleon — Swordcraft follower, 4, 3/4. 自然・指揮官・獣・プリンセス.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area. (Neither is allowed, also when
// one of them is full — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { treeOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), fanfare({ resolve: treeOntoFieldOrEx })],
});
