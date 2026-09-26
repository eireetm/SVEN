// BP08-021 Roland the Incorruptible — Swordcraft follower, 4, 3/4. 指揮官.
// Evolve (1). Ward. Fanfare: choose to search for Durandal or optionally summon one from hand.
// A card in hand may be treated as absent (CR 4.1.2.2); choices follow CR 5.18.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";

const DURANDAL = "Durandal the Incorruptible";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      modes: [
        {
          id: "search",
          label: "Search for Durandal the Incorruptible",
          *resolve(fx) { yield* fx.search((id) => named(DURANDAL)(fx.game, id)); },
        },
        {
          id: "summon",
          label: "You may summon Durandal the Incorruptible from your hand",
          targets: [inYourZone("hand", { filter: named(DURANDAL) })],
          *resolve(fx) { yield* fx.putOntoField(fx.targets[0] ?? []); },
        },
      ],
    }),
  ],
});
