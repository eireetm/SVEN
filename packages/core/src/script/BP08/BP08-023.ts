// BP08-023 Swordflash Panther — Swordcraft follower, 4, 4/3. 指揮官・獣.
// Rush. Fanfare: summon a Swordcraft follower costing 2 or less from your cemetery and give the
// new object +1 attack (a zone change creates a new object, CR 4.1.4.1; summoning CR 5.5).
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Swordcraft"), costAtMost(2)) })],
      *resolve(fx) {
        for (const id of yield* fx.putOntoField(fx.targets[0] ?? [])) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
