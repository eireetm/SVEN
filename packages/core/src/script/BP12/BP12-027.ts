// BP12-027 Panther Scout — Swordcraft follower, 2, 2/2. 自然・盗賊・獣.
// Storm.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area. (Or neither,
// also when one of them is full — ruling.)
import { defineCard, fanfare } from "../helpers";
import { TREE, tokenOntoFieldOrEx } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* tokenOntoFieldOrEx(fx, TREE);
      },
    }),
  ],
});
