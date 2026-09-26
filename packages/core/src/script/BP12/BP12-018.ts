// BP12-018 Patrick, Rhiceros Knight — Swordcraft follower, 5, 4/4. 自然・指揮官・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area. (Or neither,
// also when one of them is full — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { TREE, tokenOntoFieldOrEx } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* tokenOntoFieldOrEx(fx, TREE);
      },
    }),
  ],
});
