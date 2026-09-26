// BP17-036 Brothers United — Swordcraft spell, 1. 自然・指揮官・獣.
// Select a follower on your field with "Bayleon" in its name. Give it {[attack]}+1/{[defense]}+1, then you may put a
// Naterran Great Tree token onto your field or into your EX area. (Not playable without the target; putting none is
// allowed — rulings.)
import { defineCard, spell } from "../helpers";
import { nameIncludes, yourFollower } from "../targets";
import { treeOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: nameIncludes("Bayleon") })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        yield* treeOntoFieldOrEx(fx);
      },
    }),
  ],
});
