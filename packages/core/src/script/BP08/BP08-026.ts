// BP08-026 Azord, Duke of the Mists (Evolved) — Swordcraft follower, 4/5. 指揮官・貴族.
// Ward. On Evolve: summon up to 2 Swordcraft followers costing 2 or less from your cemetery.
// They enter simultaneously and their fanfares become pending together (ruling; CR 10.7.3.1).
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { count: 2, upTo: true, filter: and(isFollower, isClass("Swordcraft"), costAtMost(2)) })],
      *resolve(fx) { yield* fx.putOntoField(fx.targets[0] ?? []); },
    }),
  ],
});
